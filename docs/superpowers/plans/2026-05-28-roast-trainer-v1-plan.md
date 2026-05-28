# Roast Trainer v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a new `/roast` section: a swipeable Indian roast/comeback game with AI-generated scenarios, judge-scored zingers, streak + Hall of Fame retention, and server-rendered shareable PNG cards. Soft-deprecate the existing Mission Control / bots / training-plan nav (backend kept live).

**Architecture:** New Django app `roast` in `socialflow-django` (models + endpoints + LLM generator + judge + share-card renderer + topup management command). New React route `/roast` in `socialflow` with feed + hall-of-fame + profile views. Reuses Google auth, OpenRouter client, and judge fallback chain that already ship in production.

**Tech Stack:** Backend — Django 4.2 / DRF / Postgres / OpenAI SDK pointed at OpenRouter / Pillow for share-card PNG. Frontend — React 18 / MUI v6 / Framer Motion for swipe gestures / Web Share API. Spec at `docs/superpowers/specs/2026-05-28-roast-trainer-v1-design.md`.

**Two repos:**
- Backend: `/Users/rsumit123/work/socialflow-django`
- Frontend: `/Users/rsumit123/work/socialflow`

---

## File Map

### Backend (`socialflow-django`) — new `roast/` app

| File | Responsibility |
|---|---|
| `roast/__init__.py` | empty |
| `roast/apps.py` | Django AppConfig |
| `roast/models.py` | `RoastScenario`, `RoastAttempt`, `UserRoastProfile`, `HallOfFameEntry`, `SeenScenario` |
| `roast/serializers.py` | DRF serializers (Scenario, Attempt, Profile, SubmitInput) |
| `roast/views.py` | DRF views: Feed, Submit, ToggleSave, Me |
| `roast/llm.py` | Generator prompt + judge prompt + thin wrappers around shared OpenRouter client |
| `roast/share_card.py` | Pillow-based PNG renderer |
| `roast/share_views.py` | `GET /share/<id>.png` view (kept separate from JSON views) |
| `roast/urls.py` | URL routing for `/api/roast/...` |
| `roast/admin.py` | Django admin registrations |
| `roast/management/commands/topup_roast_pool.py` | Generates + caches scenarios in batches |
| `roast/migrations/0001_initial.py` | auto-generated |
| `roast/tests/test_models.py` | streak math, daily floor, dedupe |
| `roast/tests/test_views.py` | endpoint contract tests |
| `socialflow_django/urls.py` | mount `path('api/roast/', include('roast.urls'))` |
| `socialflow_django/settings.py` | add `'roast'` to INSTALLED_APPS; add `ROAST_GENERATOR_MODEL`, `ROAST_DAILY_FLOOR` config |

### Frontend (`socialflow`) — new `/roast` section

| File | Responsibility |
|---|---|
| `src/components/Roast/RoastFeed.jsx` | Main feed page — fetch, submit, swipe |
| `src/components/Roast/RoastCard.jsx` | Single roast card (setup + input + result) |
| `src/components/Roast/ScoreChips.jsx` | Wit / Savage / Cringe chip row |
| `src/components/Roast/ReactionLine.jsx` | In-character reaction (uses existing `*action*` italic styling) |
| `src/components/Roast/StreakBadge.jsx` | Header pill showing streak + daily count |
| `src/components/Roast/HallOfFame.jsx` | Personal collection page |
| `src/components/Roast/RoastMe.jsx` | Profile / stats page |
| `src/components/Roast/ShareSheet.jsx` | Web Share API wrapper |
| `src/Api/roast.js` | API client helpers (`fetchFeed`, `submitRoast`, `toggleSave`, `getMe`) |
| `src/App.jsx` | add 3 routes; mark `/roast*` as fullscreen; hide Mission Control / bots / training from nav |
| `src/components/Home.jsx` *(or equivalent)* | Rewrite to lead with `/roast` primary CTA |

---

## Task Order Rationale

Each task produces something testable on its own. Backend foundation first so the API contract is concrete before any frontend work touches it.

1. Backend models + admin + migration (T1)
2. Feed endpoint + seed data fixture (T2)
3. Submit endpoint with judge + streak math (T3)
4. Save toggle + Me endpoints (T4)
5. Generator + topup command (T5)
6. Share-card PNG renderer (T6)
7. Frontend API client + RoastCard component (T7)
8. RoastFeed page with swipe + submit flow (T8)
9. StreakBadge + header integration (T9)
10. HallOfFame + RoastMe pages (T10)
11. Share sheet integration (T11)
12. Routes wiring + soft-deprecation of existing nav (T12)
13. Home page rewrite (T13)

---

## Task 1: Bootstrap roast Django app

**Files:**
- Create: `socialflow-django/roast/__init__.py`
- Create: `socialflow-django/roast/apps.py`
- Create: `socialflow-django/roast/models.py`
- Create: `socialflow-django/roast/admin.py`
- Create: `socialflow-django/roast/tests/__init__.py`
- Create: `socialflow-django/roast/tests/test_models.py`
- Modify: `socialflow-django/socialflow_django/settings.py` — add to `INSTALLED_APPS`, add config vars

- [ ] **Step 1: Create app skeleton**

```bash
cd /Users/rsumit123/work/socialflow-django
mkdir -p roast/tests roast/management/commands roast/migrations
touch roast/__init__.py roast/tests/__init__.py roast/management/__init__.py roast/management/commands/__init__.py roast/migrations/__init__.py
```

Write `roast/apps.py`:

```python
from django.apps import AppConfig


class RoastConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "roast"
```

- [ ] **Step 2: Define models**

Write `roast/models.py`:

```python
from django.conf import settings
from django.db import models
from django.utils import timezone


CATEGORY_CHOICES = [
    ("relatives", "Relatives / family"),
    ("office", "Office / boss"),
    ("dating", "Dating / awkward"),
    ("strangers", "Strangers"),
    ("weddings", "Weddings / shaadi season"),
    ("college", "College / friends"),
]

DIFFICULTY_CHOICES = [("mild", "Mild"), ("medium", "Medium"), ("savage", "Savage")]
LANGUAGE_CHOICES = [("hinglish", "Hinglish"), ("english", "English")]


class RoastScenario(models.Model):
    character = models.CharField(max_length=64)            # "Mom", "Aunty", "Boss"
    setup_line = models.TextField()
    category = models.CharField(max_length=16, choices=CATEGORY_CHOICES)
    difficulty = models.CharField(max_length=8, choices=DIFFICULTY_CHOICES, default="medium")
    language = models.CharField(max_length=8, choices=LANGUAGE_CHOICES, default="hinglish")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["category", "language"])]


class RoastAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="roast_attempts")
    scenario = models.ForeignKey(RoastScenario, on_delete=models.CASCADE, related_name="attempts")
    user_reply = models.TextField()
    wit = models.IntegerField(null=True, blank=True)
    savage = models.IntegerField(null=True, blank=True)
    cringe = models.IntegerField(null=True, blank=True)
    reaction = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)


class UserRoastProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="roast_profile")
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_streak_date = models.DateField(null=True, blank=True)   # last day they hit the floor
    daily_count_date = models.DateField(null=True, blank=True)   # the date for which daily_count is valid
    daily_count = models.IntegerField(default=0)


class HallOfFameEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="hall_of_fame")
    attempt = models.OneToOneField(RoastAttempt, on_delete=models.CASCADE, related_name="hall_entry")
    saved_at = models.DateTimeField(auto_now_add=True)


class SeenScenario(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="seen_scenarios")
    scenario = models.ForeignKey(RoastScenario, on_delete=models.CASCADE)
    seen_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "scenario")
```

- [ ] **Step 3: Register app + config**

Modify `socialflow-django/socialflow_django/settings.py`. Find the `INSTALLED_APPS` list and add `"roast",` to the end (after `scenarios`). Then at the bottom of the file add:

```python
# Roast config
ROAST_GENERATOR_MODEL = os.getenv("ROAST_GENERATOR_MODEL", "openai/gpt-oss-120b:free")
ROAST_DAILY_FLOOR = int(os.getenv("ROAST_DAILY_FLOOR", "3"))
ROAST_POOL_TARGET = int(os.getenv("ROAST_POOL_TARGET", "50"))  # per (category, language)
```

(Confirm `os` is already imported at the top of settings; the file imports it in the existing settings.)

- [ ] **Step 4: Write streak math test (fails)**

Write `roast/tests/test_models.py`:

```python
from datetime import date, timedelta
import pytest
from django.contrib.auth import get_user_model
from roast.models import UserRoastProfile
from roast.streak import record_roast_for_today

User = get_user_model()


@pytest.mark.django_db
def test_streak_starts_at_zero_and_increments_when_floor_reached(settings):
    settings.ROAST_DAILY_FLOOR = 3
    u = User.objects.create_user(email="t@t.com", password="x")
    profile = UserRoastProfile.objects.create(user=u)

    today = date(2026, 5, 28)
    record_roast_for_today(profile, today)   # 1
    record_roast_for_today(profile, today)   # 2
    assert profile.current_streak == 0       # floor not yet hit

    record_roast_for_today(profile, today)   # 3 = floor
    assert profile.current_streak == 1
    assert profile.longest_streak == 1


@pytest.mark.django_db
def test_streak_continues_on_consecutive_days(settings):
    settings.ROAST_DAILY_FLOOR = 3
    u = User.objects.create_user(email="t2@t.com", password="x")
    profile = UserRoastProfile.objects.create(user=u, current_streak=1, longest_streak=1,
                                              last_streak_date=date(2026, 5, 27))

    today = date(2026, 5, 28)
    for _ in range(3):
        record_roast_for_today(profile, today)

    assert profile.current_streak == 2


@pytest.mark.django_db
def test_streak_resets_when_user_skips_a_day(settings):
    settings.ROAST_DAILY_FLOOR = 3
    u = User.objects.create_user(email="t3@t.com", password="x")
    profile = UserRoastProfile.objects.create(user=u, current_streak=7, longest_streak=7,
                                              last_streak_date=date(2026, 5, 25))   # skipped 26 & 27

    today = date(2026, 5, 28)
    for _ in range(3):
        record_roast_for_today(profile, today)

    assert profile.current_streak == 1     # reset then re-earned today
    assert profile.longest_streak == 7     # preserved
```

- [ ] **Step 5: One-time test infra setup (pytest is not installed yet)**

Append to `socialflow-django/requirements.txt`:

```
pytest>=8.0.0
pytest-django>=4.8.0
```

Install in the running container so we can run tests now (rebuild will pick up the requirement):

```bash
docker exec socialflow-django-web-1 pip install pytest pytest-django
```

Create `socialflow-django/pytest.ini`:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = socialflow_django.settings
python_files = tests.py test_*.py *_tests.py
```

- [ ] **Step 6: Run test, confirm it fails**

```bash
cd /Users/rsumit123/work/socialflow-django
docker exec socialflow-django-web-1 python manage.py makemigrations roast
docker exec socialflow-django-web-1 python manage.py migrate
docker exec socialflow-django-web-1 pytest roast/tests/test_models.py -v
```

Expected: ImportError on `roast.streak` (module doesn't exist yet).

- [ ] **Step 7: Implement streak logic**

Write `roast/streak.py`:

```python
from datetime import date, timedelta
from django.conf import settings


def record_roast_for_today(profile, today: date) -> None:
    """Increment daily count, then advance the streak if the daily floor is hit
    this turn. Resets streak to 1 if the user skipped one or more days before
    today. Persists changes via .save()."""

    floor = settings.ROAST_DAILY_FLOOR

    # Roll the daily counter forward to today
    if profile.daily_count_date != today:
        profile.daily_count_date = today
        profile.daily_count = 0

    previous_count = profile.daily_count
    profile.daily_count += 1

    just_hit_floor = (previous_count < floor <= profile.daily_count)

    if just_hit_floor:
        if profile.last_streak_date == today - timedelta(days=1):
            profile.current_streak += 1
        else:
            profile.current_streak = 1
        profile.last_streak_date = today
        if profile.current_streak > profile.longest_streak:
            profile.longest_streak = profile.current_streak

    profile.save()
```

- [ ] **Step 8: Run tests, confirm pass**

```bash
docker exec socialflow-django-web-1 pytest roast/tests/test_models.py -v
```

Expected: 3 passed.

- [ ] **Step 9: Register admin**

Write `roast/admin.py`:

```python
from django.contrib import admin
from .models import RoastScenario, RoastAttempt, UserRoastProfile, HallOfFameEntry, SeenScenario


@admin.register(RoastScenario)
class RoastScenarioAdmin(admin.ModelAdmin):
    list_display = ("id", "character", "category", "difficulty", "language", "created_at")
    list_filter = ("category", "difficulty", "language")
    search_fields = ("character", "setup_line")


@admin.register(RoastAttempt)
class RoastAttemptAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "scenario", "wit", "savage", "cringe", "created_at")
    list_filter = ("created_at",)


@admin.register(UserRoastProfile)
class UserRoastProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "current_streak", "longest_streak", "last_streak_date", "daily_count")


admin.site.register(HallOfFameEntry)
admin.site.register(SeenScenario)
```

- [ ] **Step 10: Commit**

```bash
cd /Users/rsumit123/work/socialflow-django
git add roast/ socialflow_django/settings.py requirements.txt pytest.ini
git commit -m "roast: bootstrap app with models, streak logic, admin, and pytest infra"
```

---

## Task 2: Feed endpoint (`GET /api/roast/feed/`)

**Files:**
- Create: `socialflow-django/roast/serializers.py`
- Create: `socialflow-django/roast/views.py`
- Create: `socialflow-django/roast/urls.py`
- Create: `socialflow-django/roast/tests/test_views.py`
- Modify: `socialflow-django/socialflow_django/urls.py`

- [ ] **Step 1: Wire the URL include**

Modify `socialflow-django/socialflow_django/urls.py`. Find the `urlpatterns` list and add:

```python
path("api/roast/", include("roast.urls")),
```

near the other `api/...` includes.

- [ ] **Step 2: Write the failing feed test**

Write `roast/tests/test_views.py`:

```python
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from roast.models import RoastScenario

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(email="feed@t.com", password="x")
    c = APIClient()
    c.force_authenticate(user=user)
    return c, user


@pytest.mark.django_db
def test_feed_returns_unseen_scenario(auth_client):
    client, user = auth_client
    s = RoastScenario.objects.create(
        character="Mom", setup_line="Sharma-ji ka beta...", category="relatives",
    )
    r = client.get("/api/roast/feed/")
    assert r.status_code == 200
    assert r.json()["id"] == s.id
    assert r.json()["character"] == "Mom"


@pytest.mark.django_db
def test_feed_skips_already_seen(auth_client):
    from roast.models import SeenScenario
    client, user = auth_client
    seen = RoastScenario.objects.create(character="Aunty", setup_line="...", category="weddings")
    fresh = RoastScenario.objects.create(character="Boss", setup_line="...", category="office")
    SeenScenario.objects.create(user=user, scenario=seen)

    r = client.get("/api/roast/feed/")
    assert r.status_code == 200
    assert r.json()["id"] == fresh.id


@pytest.mark.django_db
def test_feed_filters_by_category(auth_client):
    client, _ = auth_client
    RoastScenario.objects.create(character="Mom", setup_line="...", category="relatives")
    office = RoastScenario.objects.create(character="Boss", setup_line="...", category="office")

    r = client.get("/api/roast/feed/?category=office")
    assert r.status_code == 200
    assert r.json()["id"] == office.id


@pytest.mark.django_db
def test_feed_returns_empty_state_when_no_scenarios(auth_client):
    client, _ = auth_client
    r = client.get("/api/roast/feed/")
    assert r.status_code == 200
    assert r.json() == {"empty": True}
```

- [ ] **Step 3: Run, confirm fails**

```bash
docker exec socialflow-django-web-1 pytest roast/tests/test_views.py::test_feed_returns_unseen_scenario -v
```

Expected: 404 (URL doesn't resolve yet).

- [ ] **Step 4: Implement serializers**

Write `roast/serializers.py`:

```python
from rest_framework import serializers
from .models import RoastScenario, RoastAttempt, UserRoastProfile


class RoastScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoastScenario
        fields = ("id", "character", "setup_line", "category", "difficulty", "language")


class SubmitRoastInputSerializer(serializers.Serializer):
    user_reply = serializers.CharField(max_length=600, allow_blank=False)


class RoastAttemptOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoastAttempt
        fields = ("id", "wit", "savage", "cringe", "reaction")


class MeSerializer(serializers.ModelSerializer):
    today_count = serializers.SerializerMethodField()
    today_floor = serializers.SerializerMethodField()
    hall_of_fame_count = serializers.SerializerMethodField()

    class Meta:
        model = UserRoastProfile
        fields = ("current_streak", "longest_streak", "today_count", "today_floor", "hall_of_fame_count")

    def get_today_count(self, obj):
        from datetime import date
        return obj.daily_count if obj.daily_count_date == date.today() else 0

    def get_today_floor(self, obj):
        from django.conf import settings
        return settings.ROAST_DAILY_FLOOR

    def get_hall_of_fame_count(self, obj):
        return obj.user.hall_of_fame.count()
```

- [ ] **Step 5: Implement Feed view**

Write `roast/views.py`:

```python
from rest_framework import permissions, status, views
from rest_framework.response import Response
from .models import RoastScenario, SeenScenario
from .serializers import RoastScenarioSerializer


class FeedView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        category = request.query_params.get("category")
        language = request.query_params.get("lang", "hinglish")

        seen_ids = SeenScenario.objects.filter(user=request.user).values_list("scenario_id", flat=True)
        qs = RoastScenario.objects.exclude(id__in=seen_ids).filter(language=language)
        if category:
            qs = qs.filter(category=category)

        scenario = qs.order_by("?").first()
        if scenario is None:
            return Response({"empty": True}, status=status.HTTP_200_OK)

        SeenScenario.objects.create(user=request.user, scenario=scenario)
        return Response(RoastScenarioSerializer(scenario).data)
```

- [ ] **Step 6: Write urls.py**

Write `roast/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    path("feed/", views.FeedView.as_view(), name="roast-feed"),
]
```

- [ ] **Step 7: Run feed tests**

```bash
docker exec socialflow-django-web-1 pytest roast/tests/test_views.py -v -k feed
```

Expected: 4 passed.

- [ ] **Step 8: Commit**

```bash
cd /Users/rsumit123/work/socialflow-django
git add roast/ socialflow_django/urls.py
git commit -m "roast: add feed endpoint with dedupe + category filter"
```

---

## Task 3: Submit endpoint (judge + streak update)

**Files:**
- Create: `socialflow-django/roast/llm.py`
- Modify: `socialflow-django/roast/views.py`
- Modify: `socialflow-django/roast/urls.py`
- Modify: `socialflow-django/roast/tests/test_views.py`

- [ ] **Step 1: Write LLM judge wrapper**

Write `roast/llm.py`:

```python
import json
import logging
import os
import openai

logger = logging.getLogger(__name__)

# Reuse the same OpenRouter client config as scenarios/llm_utils.py.
_API_KEY = os.getenv("DEEPSEEK_API_KEY")
_BASE_URL = os.getenv("AI_BASE_URL")
_JUDGE_MODEL = os.getenv("JUDGE_MODEL", os.getenv("AI_MODEL", "anthropic/claude-sonnet-4.6"))
_JUDGE_FALLBACK = os.getenv("JUDGE_FALLBACK_MODEL", "anthropic/claude-sonnet-4.6")

_client = openai.OpenAI(api_key=_API_KEY, base_url=_BASE_URL) if _API_KEY else None


JUDGE_SYSTEM = (
    "You are a culturally-aware Indian comedy judge. Given an awkward situation "
    "(character + setup) and the user's one-line comeback, return a strict JSON "
    "object with integer scores 0-100 for wit, savage, cringe, and a one-line "
    "in-character reaction from the character. The reaction can use *action* "
    "asterisk wraps for body language. NEVER return anything outside the JSON."
)


def judge_roast(character: str, setup_line: str, user_reply: str) -> dict:
    """Returns {wit, savage, cringe, reaction}. Falls back to JUDGE_FALLBACK_MODEL on
    failure, then to a neutral default if both fail."""

    if not _client:
        logger.error("Roast judge: OpenRouter client not configured")
        return _default_judge_result()

    user_prompt = (
        f"CHARACTER: {character}\n"
        f"SETUP: {setup_line}\n"
        f"USER COMEBACK: {user_reply}\n\n"
        "Return JSON only: "
        '{"wit": <int 0-100>, "savage": <int 0-100>, "cringe": <int 0-100>, '
        '"reaction": "<character\'s one-line reaction, can use *action* wraps>"}'
    )

    for model in (_JUDGE_MODEL, _JUDGE_FALLBACK):
        try:
            resp = _client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": JUDGE_SYSTEM},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                timeout=20,
            )
            raw = resp.choices[0].message.content
            data = json.loads(raw)
            return {
                "wit": int(data.get("wit", 0)),
                "savage": int(data.get("savage", 0)),
                "cringe": int(data.get("cringe", 100)),
                "reaction": str(data.get("reaction", "")).strip(),
            }
        except Exception as exc:
            logger.warning("Roast judge model %s failed: %s", model, exc)
            continue

    return _default_judge_result()


def _default_judge_result() -> dict:
    return {"wit": 50, "savage": 50, "cringe": 50, "reaction": "*shrugs*"}
```

- [ ] **Step 2: Write failing submit test**

Append to `roast/tests/test_views.py`:

```python
from unittest.mock import patch
from datetime import date
from roast.models import RoastAttempt, UserRoastProfile


@pytest.mark.django_db
def test_submit_creates_attempt_and_returns_scores(auth_client, settings):
    settings.ROAST_DAILY_FLOOR = 3
    client, user = auth_client
    scenario = RoastScenario.objects.create(character="Mom", setup_line="...", category="relatives")

    fake = {"wit": 87, "savage": 72, "cringe": 8, "reaction": "*raises eyebrow* chup"}
    with patch("roast.views.judge_roast", return_value=fake):
        r = client.post(f"/api/roast/{scenario.id}/submit/", {"user_reply": "unko adopt kar lo"}, format="json")

    assert r.status_code == 200
    body = r.json()
    assert body["wit"] == 87
    assert body["reaction"] == "*raises eyebrow* chup"
    assert RoastAttempt.objects.filter(user=user, scenario=scenario).count() == 1


@pytest.mark.django_db
def test_submit_updates_daily_count_and_streak_on_floor(auth_client, settings):
    settings.ROAST_DAILY_FLOOR = 3
    client, user = auth_client
    fake = {"wit": 80, "savage": 60, "cringe": 10, "reaction": "..."}

    for i in range(3):
        s = RoastScenario.objects.create(character="X", setup_line=f"#{i}", category="relatives")
        with patch("roast.views.judge_roast", return_value=fake):
            client.post(f"/api/roast/{s.id}/submit/", {"user_reply": "x"}, format="json")

    profile = UserRoastProfile.objects.get(user=user)
    assert profile.current_streak == 1
    assert profile.daily_count == 3
```

- [ ] **Step 3: Run, confirm fails**

```bash
docker exec socialflow-django-web-1 pytest roast/tests/test_views.py -v -k submit
```

Expected: 404.

- [ ] **Step 4: Implement Submit view**

Modify `roast/views.py` — add at the bottom:

```python
from datetime import date as date_cls
from django.shortcuts import get_object_or_404
from .models import RoastAttempt, RoastScenario, UserRoastProfile, HallOfFameEntry
from .serializers import (
    SubmitRoastInputSerializer,
    RoastAttemptOutputSerializer,
    MeSerializer,
)
from .llm import judge_roast
from .streak import record_roast_for_today


class SubmitView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, scenario_id):
        scenario = get_object_or_404(RoastScenario, pk=scenario_id)
        ser = SubmitRoastInputSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user_reply = ser.validated_data["user_reply"]

        judge = judge_roast(scenario.character, scenario.setup_line, user_reply)

        attempt = RoastAttempt.objects.create(
            user=request.user, scenario=scenario, user_reply=user_reply,
            wit=judge["wit"], savage=judge["savage"], cringe=judge["cringe"], reaction=judge["reaction"],
        )

        profile, _ = UserRoastProfile.objects.get_or_create(user=request.user)
        record_roast_for_today(profile, date_cls.today())

        # Auto-save high-wit attempts to Hall of Fame
        if judge["wit"] >= 70:
            HallOfFameEntry.objects.get_or_create(user=request.user, attempt=attempt)

        out = RoastAttemptOutputSerializer(attempt).data
        out["streak"] = profile.current_streak
        out["today_count"] = profile.daily_count
        return Response(out)
```

- [ ] **Step 5: Add URL**

Modify `roast/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    path("feed/", views.FeedView.as_view(), name="roast-feed"),
    path("<int:scenario_id>/submit/", views.SubmitView.as_view(), name="roast-submit"),
]
```

- [ ] **Step 6: Run tests**

```bash
docker exec socialflow-django-web-1 pytest roast/tests/test_views.py -v
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add roast/
git commit -m "roast: submit endpoint with judge + streak + auto-save to hall of fame"
```

---

## Task 4: ToggleSave + Me endpoints

**Files:**
- Modify: `socialflow-django/roast/views.py`
- Modify: `socialflow-django/roast/urls.py`
- Modify: `socialflow-django/roast/tests/test_views.py`

- [ ] **Step 1: Write failing tests**

Append to `roast/tests/test_views.py`:

```python
@pytest.mark.django_db
def test_toggle_save_adds_and_removes(auth_client):
    client, user = auth_client
    s = RoastScenario.objects.create(character="X", setup_line="...", category="relatives")
    a = RoastAttempt.objects.create(user=user, scenario=s, user_reply="x", wit=50, savage=50, cringe=50)

    r1 = client.post(f"/api/roast/attempt/{a.id}/save/")
    assert r1.status_code == 200 and r1.json()["saved"] is True

    r2 = client.post(f"/api/roast/attempt/{a.id}/save/")
    assert r2.status_code == 200 and r2.json()["saved"] is False


@pytest.mark.django_db
def test_me_returns_streak_and_counts(auth_client, settings):
    settings.ROAST_DAILY_FLOOR = 3
    client, user = auth_client
    UserRoastProfile.objects.create(user=user, current_streak=12, longest_streak=20)

    r = client.get("/api/roast/me/")
    assert r.status_code == 200
    body = r.json()
    assert body["current_streak"] == 12
    assert body["longest_streak"] == 20
    assert body["today_floor"] == 3
    assert body["today_count"] == 0
    assert body["hall_of_fame_count"] == 0
```

- [ ] **Step 2: Run, confirm fails (404)**

```bash
docker exec socialflow-django-web-1 pytest roast/tests/test_views.py -v -k "toggle or test_me_returns"
```

- [ ] **Step 3: Implement views**

Append to `roast/views.py`:

```python
class ToggleSaveView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, attempt_id):
        attempt = get_object_or_404(RoastAttempt, pk=attempt_id, user=request.user)
        entry = HallOfFameEntry.objects.filter(user=request.user, attempt=attempt).first()
        if entry:
            entry.delete()
            return Response({"saved": False})
        HallOfFameEntry.objects.create(user=request.user, attempt=attempt)
        return Response({"saved": True})


class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = UserRoastProfile.objects.get_or_create(user=request.user)
        return Response(MeSerializer(profile).data)
```

- [ ] **Step 4: Add URLs**

Modify `roast/urls.py`:

```python
urlpatterns = [
    path("feed/", views.FeedView.as_view(), name="roast-feed"),
    path("<int:scenario_id>/submit/", views.SubmitView.as_view(), name="roast-submit"),
    path("attempt/<int:attempt_id>/save/", views.ToggleSaveView.as_view(), name="roast-save"),
    path("me/", views.MeView.as_view(), name="roast-me"),
]
```

- [ ] **Step 5: Run + commit**

```bash
docker exec socialflow-django-web-1 pytest roast/tests/test_views.py -v
git add roast/
git commit -m "roast: add toggle-save + me endpoints"
```

---

## Task 5: Generator + topup management command

**Files:**
- Modify: `socialflow-django/roast/llm.py`
- Create: `socialflow-django/roast/management/commands/topup_roast_pool.py`

- [ ] **Step 1: Add generator function to llm.py**

Append to `roast/llm.py`:

```python
GENERATOR_SYSTEM = (
    "You generate culturally Indian awkward small-talk setups for a comedy roast app. "
    "Each setup is something the named character would actually say in a real Indian "
    "social moment that needs a witty comeback. Return JSON only."
)

CATEGORY_CHARACTERS = {
    "relatives": ["Mom", "Aunty", "Uncle", "Dadi", "Nani", "Cousin Pintu"],
    "office": ["Boss", "HR", "Senior colleague", "Annoying intern"],
    "dating": ["Bumble match", "Coffee date", "Ex"],
    "strangers": ["Auto-wala", "Dukandar", "Security guard", "Cab driver"],
    "weddings": ["Shaadi aunty", "Bride's chacha", "DJ uncle"],
    "college": ["Senior", "Class topper", "Mess uncle", "Roommate"],
}


def generate_scenarios(category: str, language: str, count: int = 10) -> list[dict]:
    """Returns a list of {character, setup_line} dicts. Errors return []."""

    if not _client:
        return []

    characters = ", ".join(CATEGORY_CHARACTERS.get(category, ["Random person"]))
    model = os.getenv("ROAST_GENERATOR_MODEL", _JUDGE_MODEL)

    user_prompt = (
        f"Generate {count} unique setups for a roast game.\n"
        f"Category: {category}\n"
        f"Language: {language} (use natural {language})\n"
        f"Pick characters from: {characters}\n\n"
        'Return JSON: {"items": [{"character": "...", "setup_line": "..."}, ...]}'
    )

    try:
        resp = _client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": GENERATOR_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            timeout=30,
        )
        data = json.loads(resp.choices[0].message.content)
        items = data.get("items", [])
        return [
            {"character": str(i["character"])[:64], "setup_line": str(i["setup_line"])}
            for i in items
            if i.get("character") and i.get("setup_line")
        ]
    except Exception as exc:
        logger.warning("Roast generator failed: %s", exc)
        return []
```

- [ ] **Step 2: Write the management command**

Write `roast/management/commands/topup_roast_pool.py`:

```python
from django.conf import settings
from django.core.management.base import BaseCommand
from roast.llm import generate_scenarios, CATEGORY_CHARACTERS
from roast.models import RoastScenario


class Command(BaseCommand):
    help = "Top up the cached roast scenario pool to ROAST_POOL_TARGET per (category, language)."

    def add_arguments(self, parser):
        parser.add_argument("--languages", default="hinglish", help="comma-separated")
        parser.add_argument("--categories", default=",".join(CATEGORY_CHARACTERS.keys()))
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **opts):
        target = settings.ROAST_POOL_TARGET
        langs = [l.strip() for l in opts["languages"].split(",")]
        cats = [c.strip() for c in opts["categories"].split(",")]

        for lang in langs:
            for cat in cats:
                existing = RoastScenario.objects.filter(category=cat, language=lang).count()
                need = max(0, target - existing)
                self.stdout.write(f"  {cat}/{lang}: {existing} cached, need {need}")
                if not need or opts["dry_run"]:
                    continue

                items = generate_scenarios(cat, lang, count=min(need, 15))
                for it in items:
                    RoastScenario.objects.create(
                        character=it["character"], setup_line=it["setup_line"],
                        category=cat, language=lang,
                    )
                self.stdout.write(self.style.SUCCESS(f"    added {len(items)}"))
```

- [ ] **Step 3: Dry-run the command**

```bash
docker exec socialflow-django-web-1 python manage.py topup_roast_pool --dry-run
```

Expected: prints "0 cached, need 50" for each (category, language) combo, no API call.

- [ ] **Step 4: Generate a small live batch (warm the pool)**

```bash
docker exec socialflow-django-web-1 python manage.py topup_roast_pool --categories relatives,office
```

Expected: ~30 scenarios created. Verify via admin or:

```bash
docker exec socialflow-django-web-1 python manage.py shell -c "from roast.models import RoastScenario; print(RoastScenario.objects.count(), [s.setup_line[:60] for s in RoastScenario.objects.all()[:3]])"
```

- [ ] **Step 5: Commit**

```bash
git add roast/
git commit -m "roast: AI generator + topup_roast_pool management command"
```

---

## Task 6: Share-card PNG endpoint

**Files:**
- Create: `socialflow-django/roast/share_card.py`
- Create: `socialflow-django/roast/share_views.py`
- Modify: `socialflow-django/roast/urls.py`
- Modify: `socialflow-django/requirements.txt`

- [ ] **Step 1: Add Pillow to requirements**

Modify `socialflow-django/requirements.txt` — append:

```
Pillow>=10.0.0
```

Then in the container:

```bash
docker exec socialflow-django-web-1 pip install Pillow
```

(The runtime install lets us test before the next image rebuild. The requirement entry ensures rebuilds keep it.)

- [ ] **Step 2: Implement share-card renderer**

Write `roast/share_card.py`:

```python
import io
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350   # IG-portrait friendly
PAD = 64
BG = (15, 15, 18)
FG = (240, 240, 245)
MUTED = (160, 160, 170)
ACCENT = (255, 90, 110)

def _font(size, bold=False):
    # Bundled DejaVu ships with Pillow; fallback handled by Pillow.
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    try:
        return ImageFont.truetype(name, size)
    except Exception:
        return ImageFont.load_default()

def _wrap(draw, text, font, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines

def render(character: str, setup_line: str, user_reply: str,
           wit: int, savage: int, cringe: int, reaction: str) -> bytes:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    f_label = _font(28, bold=True)
    f_setup = _font(40, bold=True)
    f_reply = _font(56, bold=True)
    f_score = _font(34, bold=True)
    f_react = _font(32)

    y = PAD
    d.text((PAD, y), character.upper(), font=f_label, fill=ACCENT); y += 50
    for line in _wrap(d, setup_line, f_setup, W - 2*PAD):
        d.text((PAD, y), line, font=f_setup, fill=FG); y += 52

    y += 60
    d.text((PAD, y), "Your comeback", font=f_label, fill=MUTED); y += 50
    for line in _wrap(d, user_reply, f_reply, W - 2*PAD):
        d.text((PAD, y), line, font=f_reply, fill=FG); y += 72

    y += 60
    chips = f"🔥 Wit {wit}    💥 Savage {savage}    💩 Cringe {cringe}"
    d.text((PAD, y), chips, font=f_score, fill=FG); y += 60

    y += 30
    for line in _wrap(d, reaction, f_react, W - 2*PAD):
        d.text((PAD, y), line, font=f_react, fill=MUTED); y += 42

    # Footer watermark
    d.text((PAD, H - PAD - 30), "socialflow.skdev.one/roast", font=f_label, fill=MUTED)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()
```

- [ ] **Step 3: Implement the view**

Write `roast/share_views.py`:

```python
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework.views import APIView
from .models import RoastAttempt
from .share_card import render


class ShareCardView(APIView):
    # Anyone with the URL can fetch the PNG. Required for sharing in WhatsApp etc.
    permission_classes = [permissions.AllowAny]

    def get(self, request, attempt_id):
        attempt = get_object_or_404(RoastAttempt, pk=attempt_id)
        png = render(
            character=attempt.scenario.character,
            setup_line=attempt.scenario.setup_line,
            user_reply=attempt.user_reply,
            wit=attempt.wit or 0,
            savage=attempt.savage or 0,
            cringe=attempt.cringe or 0,
            reaction=attempt.reaction or "",
        )
        resp = HttpResponse(png, content_type="image/png")
        resp["Cache-Control"] = "public, max-age=86400"
        return resp
```

- [ ] **Step 4: Wire URL**

Modify `roast/urls.py`:

```python
from .share_views import ShareCardView

urlpatterns = [
    path("feed/", views.FeedView.as_view(), name="roast-feed"),
    path("<int:scenario_id>/submit/", views.SubmitView.as_view(), name="roast-submit"),
    path("attempt/<int:attempt_id>/save/", views.ToggleSaveView.as_view(), name="roast-save"),
    path("me/", views.MeView.as_view(), name="roast-me"),
    path("share/<int:attempt_id>.png", ShareCardView.as_view(), name="roast-share"),
]
```

- [ ] **Step 5: Smoke test manually**

```bash
docker exec socialflow-django-web-1 python manage.py shell -c "
from django.contrib.auth import get_user_model
from roast.models import RoastScenario, RoastAttempt
u = get_user_model().objects.first()
s = RoastScenario.objects.first()
a = RoastAttempt.objects.create(user=u, scenario=s, user_reply='unko adopt kar lo', wit=87, savage=72, cringe=8, reaction='*raises eyebrow* chup')
print('Attempt id:', a.id)
"
curl -s -o /tmp/card.png http://127.0.0.1:8080/api/roast/share/$ATTEMPT_ID.png
file /tmp/card.png
```

Expected: `/tmp/card.png: PNG image data, 1080 x 1350`.

- [ ] **Step 6: Commit**

```bash
git add roast/ requirements.txt
git commit -m "roast: server-rendered PNG share card endpoint"
```

---

## Task 7: Frontend API client + RoastCard component

**Files:**
- Create: `socialflow/src/Api/roast.js`
- Create: `socialflow/src/components/Roast/ScoreChips.jsx`
- Create: `socialflow/src/components/Roast/ReactionLine.jsx`
- Create: `socialflow/src/components/Roast/RoastCard.jsx`

- [ ] **Step 1: API client**

Write `socialflow/src/Api/roast.js`:

```javascript
import { handleAuthErrors } from './index';

const BASE = import.meta.env.VITE_BACKEND_URL;

const auth = (token) => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

export async function fetchFeed(token, navigate, { category, lang = 'hinglish' } = {}) {
  const url = new URL(`${BASE}/api/roast/feed/`);
  if (category) url.searchParams.set('category', category);
  url.searchParams.set('lang', lang);
  const r = await fetch(url, { headers: auth(token) });
  if (handleAuthErrors(r, navigate)) throw new Error('feed auth');
  return r.json();
}

export async function submitRoast(token, navigate, scenarioId, userReply) {
  const r = await fetch(`${BASE}/api/roast/${scenarioId}/submit/`, {
    method: 'POST', headers: auth(token), body: JSON.stringify({ user_reply: userReply }),
  });
  if (handleAuthErrors(r, navigate)) throw new Error('submit auth');
  return r.json();
}

export async function toggleSave(token, navigate, attemptId) {
  const r = await fetch(`${BASE}/api/roast/attempt/${attemptId}/save/`, {
    method: 'POST', headers: auth(token),
  });
  if (handleAuthErrors(r, navigate)) throw new Error('save auth');
  return r.json();
}

export async function fetchMe(token, navigate) {
  const r = await fetch(`${BASE}/api/roast/me/`, { headers: auth(token) });
  if (handleAuthErrors(r, navigate)) throw new Error('me auth');
  return r.json();
}

export function shareCardUrl(attemptId) {
  return `${BASE}/api/roast/share/${attemptId}.png`;
}
```

- [ ] **Step 2: ScoreChips**

Write `socialflow/src/components/Roast/ScoreChips.jsx`:

```jsx
import { Box, Chip } from '@mui/material';

const ScoreChips = ({ wit, savage, cringe }) => (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    <Chip label={`🔥 Wit ${wit}`} sx={{ bgcolor: 'rgba(255,90,110,0.15)', color: '#ff5a6e', fontWeight: 700 }} />
    <Chip label={`💥 Savage ${savage}`} sx={{ bgcolor: 'rgba(255,170,40,0.15)', color: '#ffaa28', fontWeight: 700 }} />
    <Chip label={`💩 Cringe ${cringe}`} sx={{ bgcolor: 'rgba(120,120,120,0.15)', color: '#a0a0a0', fontWeight: 700 }} />
  </Box>
);

export default ScoreChips;
```

- [ ] **Step 3: ReactionLine (reuses asterisk-italic pattern)**

Write `socialflow/src/components/Roast/ReactionLine.jsx`:

```jsx
import { Box, Typography } from '@mui/material';

// Renders text with *...* segments as italic muted action descriptions.
const ReactionLine = ({ text, character }) => {
  if (!text) return null;
  const STAGE = /\*([^*\n]+?)\*/g;
  const parts = [];
  let lastIdx = 0, m;
  while ((m = STAGE.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push({ kind: 'text', text: text.slice(lastIdx, m.index) });
    parts.push({ kind: 'action', text: m[1].trim() });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) parts.push({ kind: 'text', text: text.slice(lastIdx) });

  return (
    <Box sx={{ mt: 2, pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
      {character && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
          {character.toUpperCase()}
        </Typography>
      )}
      <Typography variant="body1" sx={{ mt: 0.5 }}>
        {parts.map((p, i) => p.kind === 'action' ? (
          <Box key={i} component="span" sx={{ fontStyle: 'italic', color: 'text.secondary', opacity: 0.85 }}>
            {p.text + ' '}
          </Box>
        ) : (
          <span key={i}>{p.text}</span>
        ))}
      </Typography>
    </Box>
  );
};

export default ReactionLine;
```

- [ ] **Step 4: RoastCard (the heart of the UX)**

Write `socialflow/src/components/Roast/RoastCard.jsx`:

```jsx
import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, IconButton, CircularProgress } from '@mui/material';
import { Send, BookmarkBorder, Bookmark, IosShare, Refresh } from '@mui/icons-material';
import ScoreChips from './ScoreChips';
import ReactionLine from './ReactionLine';

const RoastCard = ({ scenario, onSubmit, onSave, onShare, onNext, onRetry }) => {
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    if (!reply.trim() || busy) return;
    setBusy(true);
    try {
      const r = await onSubmit(scenario.id, reply.trim());
      setResult(r);
      setSaved(r.wit >= 70);
    } finally { setBusy(false); }
  };

  const handleSave = async () => {
    if (!result) return;
    const r = await onSave(result.id);
    setSaved(r.saved);
  };

  const handleRetry = () => { setReply(''); setResult(null); setSaved(false); onRetry?.(); };
  const handleNext = () => { setReply(''); setResult(null); setSaved(false); onNext(); };

  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: 4, maxWidth: 560, mx: 'auto', width: '100%' }}>
      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1.5 }}>
        {scenario.character.toUpperCase()}
      </Typography>
      <Typography variant="h6" sx={{ mt: 1, fontWeight: 600, lineHeight: 1.4 }}>
        {scenario.setup_line}
      </Typography>

      {!result ? (
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth multiline minRows={2} maxRows={4}
            placeholder="Your comeback…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            disabled={busy}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <Button
            fullWidth variant="contained" endIcon={busy ? <CircularProgress size={18} color="inherit" /> : <Send />}
            disabled={busy || !reply.trim()} onClick={handleSubmit} sx={{ mt: 2, borderRadius: 3, py: 1.2 }}
          >
            {busy ? 'Judging…' : 'Send'}
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>You said:</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>"{reply}"</Typography>
          <ScoreChips wit={result.wit} savage={result.savage} cringe={result.cringe} />
          <ReactionLine text={result.reaction} character={scenario.character} />
          <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'space-between' }}>
            <IconButton onClick={handleSave} aria-label="save">
              {saved ? <Bookmark color="primary" /> : <BookmarkBorder />}
            </IconButton>
            <IconButton onClick={() => onShare(result.id)} aria-label="share"><IosShare /></IconButton>
            <IconButton onClick={handleRetry} aria-label="retry"><Refresh /></IconButton>
            <Button variant="contained" onClick={handleNext} sx={{ borderRadius: 3 }}>Next ↑</Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default RoastCard;
```

- [ ] **Step 5: Commit**

```bash
cd /Users/rsumit123/work/socialflow
git add src/Api/roast.js src/components/Roast/
git commit -m "roast: API client + RoastCard, ScoreChips, ReactionLine components"
```

---

## Task 8: RoastFeed page

**Files:**
- Create: `socialflow/src/components/Roast/RoastFeed.jsx`

- [ ] **Step 1: Write RoastFeed**

Write `socialflow/src/components/Roast/RoastFeed.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { Box, Container, CircularProgress, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchFeed, submitRoast, toggleSave, shareCardUrl } from '../../Api/roast';
import RoastCard from './RoastCard';
import StreakBadge from './StreakBadge';

const RoastFeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  const loadNext = async () => {
    setLoading(true); setEmpty(false);
    try {
      const data = await fetchFeed(user.token, navigate);
      if (data.empty) setEmpty(true);
      else setScenario(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadNext(); }, []);

  const handleSubmit = (scenarioId, reply) => submitRoast(user.token, navigate, scenarioId, reply);
  const handleSave = (attemptId) => toggleSave(user.token, navigate, attemptId);

  const handleShare = async (attemptId) => {
    const url = shareCardUrl(attemptId);
    if (navigator.share) {
      try {
        // Fetch the PNG, then share as a file so WhatsApp/IG accept it as an image
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], 'roast.png', { type: 'image/png' });
        await navigator.share({ files: [file], title: 'My roast', text: 'Check out my roast comeback' });
        return;
      } catch (_) { /* fall through to copy */ }
    }
    await navigator.clipboard.writeText(url);
    alert('Card link copied!');
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>roast</Typography>
        <StreakBadge />
      </Box>
      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 3 }}>
        {loading && <CircularProgress sx={{ mx: 'auto' }} />}
        {empty && (
          <Box sx={{ textAlign: 'center', mx: 'auto' }}>
            <Typography variant="h6">No more scenarios right now.</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Fresh ones drop in soon. Check back later.
            </Typography>
          </Box>
        )}
        {scenario && !loading && (
          <RoastCard
            scenario={scenario}
            onSubmit={handleSubmit}
            onSave={handleSave}
            onShare={handleShare}
            onNext={loadNext}
          />
        )}
      </Container>
    </Box>
  );
};

export default RoastFeed;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Roast/RoastFeed.jsx
git commit -m "roast: RoastFeed page with submit + share flow"
```

---

## Task 9: StreakBadge

**Files:**
- Create: `socialflow/src/components/Roast/StreakBadge.jsx`

- [ ] **Step 1: Implement StreakBadge**

Write `socialflow/src/components/Roast/StreakBadge.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { Box, Chip, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchMe } from '../../Api/roast';

// Self-fetches; re-fetches when window regains focus so streak feels live after a roast.
const StreakBadge = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  const load = () => fetchMe(user.token, navigate).then(setMe).catch(() => {});

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  if (!me) return <CircularProgress size={18} />;
  return (
    <Chip
      label={`🔥 ${me.current_streak} · ${me.today_count}/${me.today_floor}`}
      sx={{ fontWeight: 700, bgcolor: 'rgba(255,90,110,0.12)', color: '#ff5a6e' }}
    />
  );
};

export default StreakBadge;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Roast/StreakBadge.jsx
git commit -m "roast: live StreakBadge header chip"
```

---

## Task 10: HallOfFame + RoastMe pages

**Files:**
- Create: `socialflow/src/components/Roast/HallOfFame.jsx`
- Create: `socialflow/src/components/Roast/RoastMe.jsx`

- [ ] **Step 1: HallOfFame page**

> We need a backend endpoint for the user's hall list. Add it now.

Modify `roast/views.py` — append:

```python
class HallOfFameView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        entries = HallOfFameEntry.objects.filter(user=request.user).select_related("attempt__scenario").order_by("-saved_at")
        return Response([
            {
                "id": e.attempt.id,
                "character": e.attempt.scenario.character,
                "setup_line": e.attempt.scenario.setup_line,
                "user_reply": e.attempt.user_reply,
                "wit": e.attempt.wit, "savage": e.attempt.savage, "cringe": e.attempt.cringe,
                "reaction": e.attempt.reaction,
            }
            for e in entries
        ])
```

Modify `roast/urls.py`:

```python
urlpatterns = [
    # … existing …
    path("hall-of-fame/", views.HallOfFameView.as_view(), name="roast-hall-of-fame"),
]
```

Commit backend:
```bash
cd /Users/rsumit123/work/socialflow-django
git add roast/
git commit -m "roast: hall-of-fame list endpoint"
```

Write `socialflow/src/components/Roast/HallOfFame.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, CircularProgress, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { handleAuthErrors } from '../../Api';
import ScoreChips from './ScoreChips';

const HallOfFame = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/roast/hall-of-fame/`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (handleAuthErrors(r, navigate)) return;
      setItems(await r.json());
    })();
  }, []);

  if (!items) return <Box sx={{ p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
        <IconButton onClick={() => navigate('/roast')}><ArrowBack /></IconButton>
        <Typography variant="h6" sx={{ fontWeight: 800, ml: 1 }}>Hall of Fame 🏆</Typography>
      </Box>
      <Container maxWidth="sm" sx={{ py: 2 }}>
        {items.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 8 }}>
            No saved roasts yet. Wit > 70 auto-saves.
          </Typography>
        )}
        {items.map(it => (
          <Paper key={it.id} sx={{ p: 2, mb: 2, borderRadius: 3 }}>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1 }}>
              {it.character.toUpperCase()}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              "{it.setup_line}"
            </Typography>
            <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 700 }}>
              {it.user_reply}
            </Typography>
            <Box sx={{ mt: 1.5 }}>
              <ScoreChips wit={it.wit} savage={it.savage} cringe={it.cringe} />
            </Box>
          </Paper>
        ))}
      </Container>
    </Box>
  );
};

export default HallOfFame;
```

- [ ] **Step 2: RoastMe (profile/stats)**

Write `socialflow/src/components/Roast/RoastMe.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, CircularProgress, Button, IconButton, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchMe } from '../../Api/roast';

const Stat = ({ label, value }) => (
  <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', flexGrow: 1 }}>
    <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
  </Paper>
);

const RoastMe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  useEffect(() => { fetchMe(user.token, navigate).then(setMe); }, []);

  if (!me) return <Box sx={{ p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
        <IconButton onClick={() => navigate('/roast')}><ArrowBack /></IconButton>
        <Typography variant="h6" sx={{ fontWeight: 800, ml: 1 }}>You</Typography>
      </Box>
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Stack direction="row" spacing={2}>
          <Stat label="Current streak 🔥" value={me.current_streak} />
          <Stat label="Longest streak" value={me.longest_streak} />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Stat label={`Today (floor ${me.today_floor})`} value={`${me.today_count}/${me.today_floor}`} />
          <Stat label="Hall of Fame" value={me.hall_of_fame_count} />
        </Stack>
        <Button fullWidth variant="outlined" sx={{ mt: 3, borderRadius: 3 }} onClick={() => navigate('/roast/hall-of-fame')}>
          View Hall of Fame
        </Button>
      </Container>
    </Box>
  );
};

export default RoastMe;
```

- [ ] **Step 3: Commit frontend**

```bash
cd /Users/rsumit123/work/socialflow
git add src/components/Roast/HallOfFame.jsx src/components/Roast/RoastMe.jsx
git commit -m "roast: HallOfFame + RoastMe pages"
```

---

## Task 11: Wire routes + soft-deprecate existing nav

**Files:**
- Modify: `socialflow/src/App.jsx`

- [ ] **Step 1: Inspect current App.jsx routes + nav**

```bash
cd /Users/rsumit123/work/socialflow
grep -n "Route\|FULLSCREEN_ROUTES\|/training\|/bots\|/goal-objectives" src/App.jsx | head -40
```

Read the relevant chunks to understand the existing routing + nav-hiding pattern (the file already uses `FULLSCREEN_ROUTES` and `Header`/`Footer` wrappers — reuse that pattern).

- [ ] **Step 2: Add /roast routes + fullscreen marker**

Modify `src/App.jsx`:

1. At the top, add imports:
```jsx
import RoastFeed from './components/Roast/RoastFeed';
import HallOfFame from './components/Roast/HallOfFame';
import RoastMe from './components/Roast/RoastMe';
```

2. Find the `FULLSCREEN_ROUTES` array (around line 84 per earlier inspection) and add:
```jsx
'/roast', '/roast/hall-of-fame', '/roast/me'
```
to the list so the global Header/Footer are hidden on those routes.

3. Inside the `<Routes>` block, add (wrap each in `<ProtectedRoute>` matching the existing pattern):
```jsx
<Route path="/roast" element={<ProtectedRoute><RoastFeed /></ProtectedRoute>} />
<Route path="/roast/hall-of-fame" element={<ProtectedRoute><HallOfFame /></ProtectedRoute>} />
<Route path="/roast/me" element={<ProtectedRoute><RoastMe /></ProtectedRoute>} />
```

- [ ] **Step 3: Hide old sections from nav**

In `src/App.jsx` and any `Header` / nav component (find via `grep -rn "Mission Control\|goal-objectives\|/bots\|/training" src/components/`), comment out OR conditionally hide the nav links for:
- Mission Control / goal-objectives
- Bots / Chat (free chat)
- Training Plan / lessons

Leave the routes in `<Routes>` intact so direct URLs still work. Only remove the links/buttons that point users there from the home/nav.

Suggested approach: introduce a constant at the top of the nav component:
```jsx
const SHOW_LEGACY = false;
```
and gate each legacy link behind `{SHOW_LEGACY && (...) }`. One flip reverts everything.

- [ ] **Step 4: Build + smoke test**

```bash
cd /Users/rsumit123/work/socialflow
npm run build
```

Expected: build succeeds with no errors.

Then locally:
```bash
npm run dev
```
- Visit `/roast` — see the feed (after authenticating).
- Visit `/goal-objectives` directly — should still work (route alive).
- Home/nav should NOT show "Mission Control" / "Bots" / "Training".

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/components/
git commit -m "roast: wire /roast routes; soft-deprecate legacy nav (links hidden, routes alive)"
```

---

## Task 12: Home page rewrite — lead with /roast

**Files:**
- Modify: `socialflow/src/components/Home.jsx` *(actual filename TBD; find it in step 1)*

- [ ] **Step 1: Find the current home component**

```bash
cd /Users/rsumit123/work/socialflow
grep -rn 'path="/"' src/App.jsx
```

That gives the component rendered at `/`. Open it.

- [ ] **Step 2: Rewrite hero**

Replace the current hero/feature-grid with a single prominent CTA pointing to `/roast`. Keep the existing styling primitives (MUI, current theme) so it doesn't look pasted-in.

Reference content the rewrite should communicate:
- One-liner: "Daily Indian roast comeback game"
- Single primary button: "Start roasting →" → `/roast`
- One supporting line: "3 roasts a day keeps your streak alive"
- Below the fold (optional): subtle "Legacy training mode" link to `/goal-objectives` for existing users. Small, muted.

Skeleton (drop in, adapt to existing theme):

```jsx
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h2" sx={{ fontWeight: 900, mb: 2 }}>roast 🔥</Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
          The daily Indian comeback game.
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          3 roasts a day keeps your streak alive.
        </Typography>
        <Stack spacing={1} alignItems="center">
          <Button size="large" variant="contained" onClick={() => navigate('/roast')} sx={{ px: 6, py: 1.5, borderRadius: 3 }}>
            Start roasting →
          </Button>
          <Button size="small" variant="text" onClick={() => navigate('/goal-objectives')} sx={{ color: 'text.secondary', mt: 2 }}>
            Looking for the training mode?
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default Home;
```

- [ ] **Step 3: Build + visual smoke**

```bash
npm run build && npm run dev
```
Open `/` — confirm the roast hero shows, button routes to `/roast`.

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "home: rewrite to lead with /roast as the primary CTA"
```

---

## Task 13: Deploy + production smoke test

**Files:** none — runtime steps only.

- [ ] **Step 1: Push backend**

```bash
cd /Users/rsumit123/work/socialflow-django
git push origin main
```

- [ ] **Step 2: Pull on VM + migrate + recreate web**

```bash
ssh ssh-social 'cd socialflow-django && git pull origin main && \
  docker compose up -d web && sleep 5 && \
  docker exec socialflow-django-web-1 python manage.py migrate roast && \
  docker exec socialflow-django-nginx-1 nginx -s reload && \
  docker exec socialflow-django-web-1 python manage.py topup_roast_pool --languages hinglish --categories relatives,office'
```

Expected: migration applies; pool fills with ~20-30 scenarios.

- [ ] **Step 3: Push frontend**

```bash
cd /Users/rsumit123/work/socialflow
git push origin main
```

Vercel auto-deploys in ~1 min.

- [ ] **Step 4: Production smoke test**

In a real browser, signed in:
- `/` shows the roast hero
- `/roast` loads, scenario appears
- Submit a comeback → see scores + reaction
- Save toggles
- Share button opens native share sheet (mobile) / copies link (desktop)
- `/roast/me` shows streak
- After 3 submissions same day, streak goes 0 → 1 in header
- `/goal-objectives` (legacy) still works via direct URL
- Old nav links no longer visible on home

- [ ] **Step 5: Top up all categories**

```bash
ssh ssh-social 'docker exec socialflow-django-web-1 python manage.py topup_roast_pool'
```

Expected: all 6 categories filled to 50 each in Hinglish.

- [ ] **Step 6: (Optional) schedule pool topup**

Add a host-level cron entry on the VM:

```bash
ssh ssh-social 'crontab -l 2>/dev/null; echo "*/30 * * * * docker exec socialflow-django-web-1 python manage.py topup_roast_pool >> /tmp/roast-topup.log 2>&1" | crontab -'
```

Verify with `crontab -l`.

---

## Self-review notes

After writing this plan I re-checked it against the spec:

- ✅ §3 single-shot zinger format → Task 8 RoastCard renders one round.
- ✅ §4 in-character reaction → Task 7 `ReactionLine.jsx` + Task 3 judge return.
- ✅ §5 endless feed of AI-generated scenarios → Task 2 feed + Task 5 generator.
- ✅ §5 per-user dedupe → Task 1 `SeenScenario` + Task 2 `exclude(id__in=...)`.
- ✅ §6 three-score rubric + reaction → Task 3 `judge_roast` returns all four.
- ✅ §7 3-roast daily floor + streak + auto-save threshold of 70 → Task 1 streak logic + Task 3 submit.
- ✅ §8 server-rendered PNG share card → Task 6.
- ✅ §8 Web Share API → Task 8 `handleShare`.
- ✅ §9 backend models + endpoints exactly match spec.
- ✅ §10 soft-deprecate legacy nav, keep routes → Task 11.
- ✅ §11 risks (budget cap, push) deferred consciously per spec; not mandatory for v1 ship.
- ✅ §12 success criteria are observation-only; nothing to implement.

No placeholders. No "implement appropriate error handling" hand-waves. Types/method names consistent across tasks (judge function is `judge_roast` everywhere; streak is `record_roast_for_today` everywhere; auth header pattern is `Authorization: Bearer …` everywhere; URLs `/api/roast/<id>/submit/` everywhere).
