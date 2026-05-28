# Roast Trainer v1 — Design Spec

**Date:** 2026-05-28
**Status:** Draft, pending user sign-off
**Working name:** `/roast` (final brand TBD)

## 1. Context & motivation

The current socialflow app is a multi-feature "social skills trainer" (Mission Control scenarios, free-chat bots, training plan/lessons, report cards). After honest review, the generalist social-skills-trainer thesis is unlikely to retain users — social skills lack objective progress markers, the reward is invisible, and the "training" framing has school energy that users avoid.

**New thesis:** abandon learning-first framing. Build a culturally Indian roast/comeback game where the screenshot is the marketing channel and "improvement" is incidental to fun. Engagement-first.

## 2. Goals & non-goals

**Goals:**
- A swipeable, screenshot-shareable roast/comeback experience.
- Sticky for the small number of early users via streak + Hall of Fame.
- Reuse existing infrastructure (auth, LLM client, judge model fallback).
- Soft-deprecate existing features without deleting backend.

**Non-goals (v1):**
- Friend leagues, leaderboards, social graph.
- Voice input / TTS.
- Monetization.
- User-generated scenarios.
- Multi-turn rap-battle mode.
- Daily-drop ritual (endless feed instead).
- Languages other than Hinglish + English.
- "Teaching" anything measurable.

## 3. Core concept

AI throws the user a relatable Indian awkward setup ("MOM: Sharma-ji ka beta 20 LPA pa raha hai, tu kya kar raha hai?"). User types **one zinger**. AI scores it on three dimensions (Wit / Savage / Cringe) and the character reacts in their voice ("MOM, *taken aback*: kya zubaan chal rahi hai aaj!"). User saves, shares, or swipes for the next one. **3 roasts/day** maintains a streak.

Lives at `/roast` inside the existing socialflow app. Existing routes (Mission Control, bots, training plan, report cards) are **hidden from navigation but still functional via direct URL** — soft deprecation, easy revert.

## 4. Core loop (one round, ~30 seconds)

1. Card appears with character emoji + name + setup line.
2. User types one reply into a text input. No hard length cap; UI hints "one-liner is best".
3. User taps **Send** → ~1.5s spinner.
4. Judge LLM returns:
   - `wit` 0-100
   - `savage` 0-100
   - `cringe` 0-100
   - `reaction` — one line of in-character response from the roastee
5. Result card replaces the input area, showing score chips + the in-character reaction.
6. Action bar:
   - 💾 Save to Hall of Fame (auto-checked if wit > 70)
   - 📱 Share (Web Share API → WhatsApp / IG / Twitter)
   - ↻ Try again (free in v1 — same setup, new attempt)
   - Swipe up = next scenario
7. Daily count increments on every submitted roast. Streak increments by 1 the moment the user submits their 3rd roast of the day (the daily floor). Both visible in header (`🔥 12 · 2/3`).

## 5. Content engine

All scenarios are AI-generated and cached. The user-facing feed pulls from a pre-warmed pool.

- **Generator model:** cheap tier (`openai/gpt-oss-120b:free` or `gemini-2.0-flash`) seeded with `{category, difficulty, language}`.
- **Scenario shape:** `character` (named persona — Mom, Aunty, Boss, Cousin Pintu, Auntie at wedding, Auto-wala…), `setup_line` (Hinglish or English), `category` tag, `difficulty` (mild | medium | savage).
- **Caching:** background management command (`topup_roast_pool`) keeps ~50 fresh scenarios per `{category, language}` cell cached in DB.
- **Per-user dedupe:** each user is tracked against scenarios they've already seen; feed never repeats within a reasonable window.

**Categories** (user picks a "Vibe", default Random):
- 👨‍👩‍👧 Relatives / family
- 💼 Office / boss
- 💕 Dating / awkward
- 🛺 Strangers (auto-wala, dukandar, security guard)
- 🎉 Weddings / shaadi season
- 🎓 College / friends

## 6. Scoring & in-character reaction

The judge LLM (Sonnet 4.6 primary, gpt-oss-120b free fallback) returns structured JSON:

```json
{
  "wit": 87,
  "savage": 72,
  "cringe": 8,
  "reaction": "*raises an eyebrow* kya zubaan chal rahi hai aaj!"
}
```

**Score semantics:**
- High wit + low cringe = clever, lands well.
- High savage with low cringe = cutting and clean.
- High cringe = tried too hard; AI lightly mocks the user in character (never harsh).
- High wit + high savage + low cringe = celebration animation + auto-save.

**The reaction is the actual fun.** Numbers are screenshot-decoration; the in-character one-liner is what makes users laugh and re-share.

## 7. Retention mechanics

- **Daily floor:** 3 roasts per day to maintain streak.
- **Reset:** streak resets at midnight IST if floor not met. No grace days in v1.
- **Notification** at user-chosen time (default 9 PM IST) if today's count < 3. Web Push as primary; if iOS support is too flaky we ship v1 without notifications and revisit (this is acceptable — losing the nudge for v1 doesn't kill the loop).
- **Hall of Fame:** every roast with wit > 70 auto-saves; user can manually save any. Persistent, sortable by wit, shareable as a "wall".
- **No friend graph in v1.**

## 8. Share / growth mechanic

The share card is the growth channel. Every screenshot in a WhatsApp group is potential acquisition.

- **Server-generated PNG** per roast (Pillow or headless browser screenshot):
  - Character + setup at top
  - User's zinger in middle (large readable font)
  - Score chips + roastee reaction at bottom
  - Subtle watermark + URL (e.g. `socialflow.skdev.one/roast`)
- **One-tap share** via Web Share API on mobile.
- **Hall of Fame "share wall"** — longer card showing user's top 5 zingers.

## 9. Architecture

### Backend (Django) — new `roast` app

**Models:**
- `RoastScenario` — `id, character, setup_line, category, difficulty, language, created_at`
- `RoastAttempt` — `id, user (FK), scenario (FK), user_reply, wit, savage, cringe, reaction, created_at`
- `UserRoastProfile` — `user (1:1), current_streak, longest_streak, last_played_date, daily_count_today`
- `HallOfFameEntry` — `user (FK), attempt (FK, unique), saved_at`
- `SeenScenario` — `user (FK), scenario (FK)` (dedupe)

**Endpoints (`/api/roast/...`):**
- `GET /feed/?category=&lang=` → next unseen scenario from the pool
- `POST /<scenario_id>/submit/` → body `{user_reply}` → returns `{wit, savage, cringe, reaction, attempt_id}`; updates streak + daily count
- `POST /attempt/<id>/save/` → toggles Hall of Fame
- `GET /me/` → `{current_streak, longest_streak, hall_of_fame_count, today_count, today_floor, recent_best[]}`
- `GET /share/<attempt_id>.png` → server-rendered share card

**Reuse from existing stack:**
- ✅ Google OAuth + AuthContext
- ✅ OpenRouter client + `JUDGE_MODEL` / `JUDGE_FALLBACK_MODEL` fallback chain
- ✅ Django + DRF + simplejwt + drf-yasg

**Background:**
- Management command `topup_roast_pool` runs on a schedule (cron in compose or a simple loop) to keep ~50 fresh scenarios per `{category, language}` cached. Estimated cost: ~$0.50/day at v1 scale. **Add a budget cap as a config var.**

### Frontend (React) — new route `/roast`

**Routes:**
- `/roast` → Feed (default; full-screen, no header/footer)
- `/roast/hall-of-fame` → personal collection
- `/roast/me` → streak + stats

**Components:**
- `RoastCard` — the main interaction card
- `ScoreChips` — Wit / Savage / Cringe row
- `ReactionLine` — in-character response, styled italic / muted
- `StreakBadge` — header pill
- `ShareSheet` — Web Share API wrapper with PNG fetch

**UX details:**
- Swipe up = next scenario (Framer Motion)
- Swipe right = skip (no penalty, no XP loss)
- Header shows streak + today's count (`🔥 12 · 2/3`)
- App-level home (`/`) rewritten so `/roast` is the primary CTA; existing app sections hidden from the nav.

## 10. Scope of changes

| Component | v1 fate |
|---|---|
| Google auth, JWT, AuthContext | Keep — reuse |
| OpenRouter + judge fallback | Keep — reuse |
| `scenarios` app + Mission Control routes | Hide from nav, backend alive |
| `chat_views.py` bots feature | Hide from nav, backend alive |
| `course_content` training plan | Hide from nav, backend alive |
| Report cards | Hide from nav, backend alive |
| Home page (`/`) | Rewrite — lead with `/roast` |

**Nothing is deleted in v1.** All deprecation is purely UI-level. Full revert = one PR removing nav hides.

## 11. Open risks / things to monitor

- **Generator quality:** cheap-tier models may produce stale or repetitive setups. Mitigation: review the pool weekly; raise to Sonnet for generation if needed.
- **Judge tone calibration:** Sonnet may be too sanitized for "Savage" scoring. Will need few-shot examples in the judge prompt to anchor the cultural register.
- **Background pool cost:** ~$0.50/day is fine at v1 scale; balloons with `categories × languages × difficulty`. Add a hard daily spend cap.
- **Push notification opt-in:** mobile web push is finicky on iOS. May need to fall back to email reminders.
- **Cultural sensitivity:** roast content can shade into casteist / sexist / religious territory easily. Need an automated content filter on generated scenarios + a user report flow.

## 12. Success criteria

After 6-8 weeks live, the v1 is "working" if:
- DAU / MAU > 0.25 (Snapchat-tier stickiness)
- Average streak length among returning users > 5 days
- At least 10% of attempts are shared
- Share-driven acquisitions > 0 (any organic traffic from shared cards)

If these are not hit, the engagement-first thesis is wrong and we reconsider.

## 13. Future work (post-v1, explicitly deferred)

- Friend leagues + private leaderboards
- Voice input (speak your zinger) + TTS reactions
- "Savage mode" premium category packs (monetization probe)
- User-generated scenarios with moderation
- Multi-turn rap-battle mode as alternate game type
- Daily-drop ritual as alternate game type
