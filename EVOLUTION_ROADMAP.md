# SocialFlow Evolution Roadmap

*Deep audit by a 3-agent team: Architect (code), UX Researcher (browser), Creative Strategist (prompts)*
*Date: February 9, 2026*

---

## TEAM FINDINGS AT A GLANCE

| Agent | Key Discovery |
|-------|--------------|
| **The Architect** | Temperature parameter has **never actually worked** (Python syntax bug at `utils.py:33`). Synchronous AI calls block the entire server. Evaluation code is copy-pasted in two places. Score defaults to 0 on parse failures -- users get false-zero report cards. |
| **The UX Researcher** | Quick Bites feels like a **timed exam** (single response + instant grade). Dynamic Dialogues has a visible **(3/10) message counter** that turns conversation into a progress bar grind. Mission Control is the strongest mode but has goal detection issues. Bot persona/scenario mismatches exist (Hinglish "Desi Dost" playing "Liam in Barcelona"). |
| **The Creative Strategist** | All 19 scenarios are uniformly pleasant -- no conflict, no stakes, no consequences. The bot says "You have completed the game!" when done. The evaluation prompt is in an unversioned `.env` variable. The `<Psychology/>` brain icon avatar and "AI is typing" indicator scream "you're talking to a machine." |

---

## ARCHITECTURE OVERVIEW

### Frontend (`socialflow/src`)
- **Framework**: React (Vite) with Material UI (MUI)
- **State Management**: React Context (`AuthContext`) for auth; local `useState` for component state; React Query for server-state caching
- **Routing**: React Router v6 with `ProtectedRoute` and `GuestRoute` wrappers
- **HTTP Client**: Mixed `axios` and `fetch` (inconsistent -- see P1 issues)

### Backend (`socialflow-backend`)
- **Framework**: Flask with SQLAlchemy (SQLite), Flask-Migrate, Flask-CORS
- **Auth**: Custom JWT with `@token_required` decorator
- **AI Integration**: DeepSeek API via synchronous HTTP calls (`utils.py`)
- **Models**: User, ChatSession, ChatMessage, ReportCard
- **Data**: Scenarios in `scenario.json` (9 entries) and `role_scenario.json` (10 entries)

### Three Core Modes
1. **Quick Bites** -- Timed single-response challenges (90 seconds). User reads Context + Objective, writes one response, gets instant AI evaluation score.
2. **Dynamic Dialogues (Evaluate)** -- Multi-turn chat with AI personas (Desi Dost, Tech Guru, Chill Bro). Report card after 10 messages.
3. **Mission Control** -- Goal-based scenarios with real-time coaching, per-message feedback, and goal achievement detection.

---

## MODE-BY-MODE UX AUDIT

### Quick Bites -- UX Researcher Findings

**What works:**
- Clean scenario cards with category filters (IceBreakers, Humor, Empathy, Engagement)
- Clear target scores on each card (Target: 75, 80, 85)
- Culturally relevant scenarios (IIT Study Group, Friends Dinner, Cafe Meetup in Bangalore, Diwali Celebration)
- Voice input option alongside text

**Uncanny valley / clunky moments:**
- **Single-turn interaction feels like a test, not a conversation.** You submit ONE response, immediately get a score in a modal. There is no back-and-forth, no flow, no social dynamics. It is closer to a writing prompt than social practice.
- **Timer creates anxiety without stakes.** The 90-second countdown adds pressure but does not simulate real social pressure (which comes from emotional consequences, not clocks).
- **Immediate score reveal breaks immersion.** Score: 90 appears in a modal with "Well Done!" -- no narrative context, no character reaction, just a number.
- **Generic feedback.** The feedback ("Great initiation! You created a warm atmosphere, but try to engage others' responses more directly for even better inclusion.") is brief and vague compared to Mission Control's detailed coaching.
- **No bot response in-character.** The scenario describes other people (dinner party guests, study group members) but you never see them react. You talk into a void and get graded.
- **Progress bar at top only has one step.** Reinforces the "single submission" feel.

**Recommendation:** Quick Bites could become much more powerful with even 2-3 turns. Let the user submit, show an in-character reaction from the NPCs, then give the user one more chance to respond. Grade the full mini-exchange, not a single line.

---

### Dynamic Dialogues (Evaluate) -- UX Researcher Findings

**What works:**
- Three distinct bot personas (Desi Dost, Tech Guru, Chill Bro) with clear personality descriptions
- Multi-turn conversation allows actual dialogue practice
- Chat Session counter (2/10) tracks progress toward evaluation

**Uncanny valley / clunky moments:**
- **Persona/scenario mismatch.** The "Desi Dost" persona (Hinglish-speaking Indian buddy) was assigned a scenario about "Liam, the musician" in Barcelona. The bot completely ignores Liam and speaks Hinglish as "itself." The persona overrides the character context rather than inhabiting it.
- **Message counter (X/10) in header destroys immersion.** The user is not having a conversation; they are running down a meter. Combined with the snackbar ("Keep going for 7 more messages!"), it feels like filling a progress bar.
- **"AI is typing..." indicator.** Use the character's name instead.
- **Bot avatar is a brain icon (`<Psychology/>`).** Screams "you're talking to a machine."
- **Welcome modal says "conversation with our AI character."** Breaks fourth wall immediately.
- **Chat does not fill viewport.** The footer is fully visible below the chat area, making the conversation feel small and incomplete. Chat should be full-height with input pinned at the bottom.
- **Bot response pattern is formulaic.** Every response follows: acknowledge what user said + ask a redirect question. No interruptions, no topic changes, no personality quirks, no emotional variation.

---

### Mission Control -- UX Researcher Findings

**What works (this is the strongest mode):**
- **Specific, actionable goals.** "Find out what the uncle's favorite snack is with his evening chai in a natural conversation." -- far more engaging than abstract evaluation.
- **Leveling and progression.** Scenarios are locked until you complete prior ones (Level 1 -> 2 -> 3). Creates a learning path.
- **Excellent per-message coaching.** The "Detailed Coach Feedback" popup gives specific, actionable advice: "While 'Aaj ki chai kaisi hai?' is friendly, it doesn't invite a detailed response. Consider using open-ended questions like 'What do you enjoy most about your evening chai ritual?'" This is genuinely useful coaching.
- **Real-time coaching tips** appear after each message.
- **Culturally rich scenarios.** The Chai Wallah's Corner, The Metro Station Wait, The College Canteen Queue -- all Indian everyday contexts that feel authentic.
- **Goal evaluation with celebration.** "Goal Achieved!" with trophy, score (85/100), and confetti.
- **Voice input + text input** both available.
- **Force evaluation option** for when users think they've achieved the goal.

**Issues found:**
- **Goal auto-detection is too strict.** In my test, the uncle explicitly mentioned "samose ya pakode" as his favorite with chai -- which IS the answer to the goal ("find out what the uncle's favorite snack is"). But the system said "Goal Not Yet Detected." I had to force-evaluate, and then it confirmed Goal Achieved with 85/100. The auto-detection should have caught this.
- **Footer visible below chat** -- same layout issue as Dynamic Dialogues. The chat area should be full-height.
- **Only 2 paths available** (Mastering Small Talk: 3 scenarios, Handling Difficult Conversations: 3 scenarios). The library feels thin -- users will exhaust content quickly.
- **Locked scenarios may frustrate.** Level 2 and 3 are padlocked until you complete prior levels. This is good for structure but there is no skip option for advanced users.
- **No visual differentiation of difficulty.** Level 1, 2, 3 look identical aside from the label. Color coding or visual complexity cues would help.
- **The "force evaluate" UX is punitive.** The warning "This might impact your final score" in orange feels like a penalty for using the feature. If the user genuinely achieved the goal and auto-detection missed it, they should not be punished.
- **Coaching intro modal is long.** Three feature cards + a button to start. Could be condensed or shown only on first visit.

**Recommendation:** Mission Control is the closest to the ideal product. Invest heavily here: more paths, more scenarios, better goal detection, and bring the coaching quality into the other modes.

---

## PHASE 1: CRITICAL FIXES (Week 1-2)

### P0 -- Ship-Blockers

**1. Fix the Temperature Bug** -- `socialflow-backend/utils.py:33`

The payload contains `temperature:temperature` instead of `'temperature': temperature`. In Python, this creates a dict entry `{1.3: 1.3}` instead of `{'temperature': 1.3}`. The DeepSeek API ignores the unknown key and uses its default temperature. **The temperature parameter has never worked.** This is a one-character fix with immediate impact on response variety.

**2. Add Request Timeouts to AI Calls** -- `socialflow-backend/utils.py:37`

`requests.post(api_url, ...)` has no `timeout` parameter. If DeepSeek hangs, Flask blocks **forever**. Add `timeout=30`.

**3. Fix Silent Grading Failures** -- `socialflow-backend/utils.py:76-154`, `socialflow-backend/app.py:474-478`

When AI evaluation output cannot be parsed, scores default to `0`. A user who had a great conversation sees "Needs Improvement" (0/0/0). On the regex fallback path, scores are `None`, causing `int(None)` to crash (500 error). Fix: return null scores with a `parsing_failed` flag. Show "Evaluation pending" on frontend. Add retry logic.

**4. Remove `escape()` from Message Storage** -- `socialflow-backend/app.py:382`

`escape(user_message)` converts `&` to `&amp;` BEFORE sending to the AI. The bot receives HTML entities instead of natural text, degrading conversation quality and evaluation accuracy. Move XSS protection to the rendering layer.

**5. Make AI Evaluation Async** -- `socialflow-backend/app.py:460-574`

The 10th message triggers TWO synchronous DeepSeek calls (response + evaluation) in a single request -- 10-15 second response time. Move evaluation to a background task (Celery, RQ, or at minimum `after_this_request`).

---

## PHASE 2: UX IMMERSION OVERHAUL (Week 2-4)

### Kill the "Test" Feel

**6. Remove the Message Counter** -- `src/components/Chat/Chat.jsx:542`

The `(3/10)` counter in the header turns every conversation into a visible countdown. Track internally for evaluation trigger, never show it to the user.

**7. Kill the Motivational Snackbar** -- `src/components/Chat/Chat.jsx:151-157`

"You are doing good. Keep going for 7 more messages!" is the #1 immersion breaker. Remove entirely or replace with contextual narrative cues from the bot itself.

**8. Replace "Game Complete" Language** -- `socialflow-backend/app.py:561`

Replace "You have completed the game! Your performance has been evaluated. Go to Report Cards to view your Score." with a natural farewell from the bot character, then show evaluation UI separately.

**9. Fix Bot Identity Signals**

| Current | Fix | File |
|---------|-----|------|
| `<Psychology/>` brain icon avatar | Character name initials from `ai_name` | `src/components/Chat/MessageBubble.jsx:59` |
| "AI is typing..." | "Timmy is typing..." (use `ai_name`) | `src/components/JustChat.jsx:284` |
| "conversation with our AI character" | "conversation with [character name]" | `src/components/Chat/Chat.jsx:415` |

**10. Fix Persona/Scenario Mismatches**

The Desi Dost (Hinglish persona) was assigned to "Liam the musician in Barcelona." The V2 role system needs to ensure persona language matches character context. Either the persona adapts to the character, or characters are pre-matched to personas.

**11. Fix Chat Layout (All Modes)**

Chat area does not fill viewport -- footer is fully visible below. This affects Dynamic Dialogues, Mission Control, and the standalone chat. Chat should be `height: calc(100vh - navbar)` with input pinned at bottom, no footer visible during conversation.

**12. Improve Mission Control Goal Detection**

Goal auto-detection is too strict. In testing, the uncle explicitly said "samose ya pakode" as his favorites with chai, directly answering the goal, but the system reported "Goal Not Yet Detected." Consider:
- Lowering the detection threshold
- Using semantic similarity rather than exact matching
- Adding intermediate signals ("Getting warmer..." instead of binary detected/not)

**13. Soften Force Evaluation UX**

The "This might impact your final score" warning in orange feels punitive. If the user correctly achieved the goal and auto-detection missed it, they should not be penalized. Rephrase to: "Let's check if you've achieved your goal!"

---

## PHASE 3: REALISM ENGINE (Month 2)

### Creative Proposal 1: "Emotional Weather" -- Dynamic Bot Mood System

**The Insight**: Consistent pleasantness is the #1 tell that you are talking to a bot. Real humans have mood fluctuations driven by reciprocal affect and internal state.

**How it works**:
- Each scenario gets a **mood seed** (distracted, nostalgic, low-energy, buzzing, guarded) selected at session creation
- **Mood drift rules** in the system prompt: "If the user asks a genuinely interesting question, become more animated. If they give short answers 3x in a row, lose interest."
- **Mood interrupts**: Every 4-5 messages, inject a system message like `[Your phone just buzzed. You glance at it and seem preoccupied.]`

**Files to modify**: `socialflow-backend/role_scenario.json` (add mood data), `socialflow-backend/app.py:324` (inject mood into prompt), `INITIAL_PROMPT_V2` env var (add mood instructions)

**Risk**: DeepSeek may overdramatize mood shifts. Needs A/B testing against always-pleasant baseline.

---

### Creative Proposal 2: "The Stakes Engine" -- Consequence-Driven Branching

**The Insight**: Loss aversion (Kahneman & Tversky) -- people are 2-3x more motivated by losing something than gaining something. Currently there are ZERO consequences for bad conversation.

**How it works**:
- Each scenario gets **hidden opportunities** ("Timmy knows of a job opening, but only mentions it if the conversation goes well")
- **Deterioration triggers** ("If the user is dismissive 3 times, Timmy politely excuses himself -- conversation ends early")
- **Narrative outcomes** replace the generic score modal: "Timmy mentioned a job opening!" vs "Timmy excused himself before you could learn more."

**Files to modify**: `socialflow-backend/role_scenario.json` (add stakes object), `socialflow-backend/app.py:440` (early exit detection), `src/components/Chat/Chat.jsx:313-386` (narrative outcome modals)

**Risk**: May feel punitive for beginners struggling with social skills. Needs a "safety net" (post-failure coaching).

---

### Creative Proposal 3: "Improv Mode" -- Curveball Injection

**The Insight**: Scripted practice transfers poorly to real life. Improvisational practice transfers well. The psychological principle is cognitive flexibility.

**How it works**:
- Every 3-4 messages, inject a **curveball** system message: topic pivots, emotional shifts, a third person entering the conversation, a slightly controversial question
- Progressive difficulty: no curveballs in session 1, mild ones in sessions 2-3, full improv after session 5
- Post-curveball coaching: "Nice job rolling with that topic change!"

**Curveball categories**:
- **Topic Pivot**: Bot suddenly remembers something tangentially related
- **Emotional Shift**: Bot has a strong reaction to something the user said
- **Social Pressure**: A third person briefly enters the conversation
- **Vulnerability**: Bot shares something personal to test user's empathy

**Files to modify**: New `socialflow-backend/curveballs.json`, `socialflow-backend/app.py:440` (injection logic), `src/components/GoalScenarioChat/GoalScenarioChat.jsx` (extend coaching tips)

**Risk**: Curveballs could feel jarring. Progressive difficulty rollout is essential.

---

## PHASE 4: ARCHITECTURE HARDENING (Month 2-3)

**14. Deduplicate Evaluation Code** -- `socialflow-backend/app.py:460-574`

Evaluation logic is copy-pasted between the `message_count == 10` branch and the `'end chat'` branch. Extract into `trigger_evaluation()`.

**15. Standardize HTTP Client** -- Multiple frontend files

Frontend mixes `axios` (with interceptors) and `fetch` (without). The axios interceptor handles auth errors; fetch-based calls have manual error handling that is subtly different. Convert all `fetch` to `axios`.

Affected files:
- `src/components/GoalScenarioChat/GoalScenarioChat.jsx` (uses fetch)
- `src/components/LessonDetail/LessonDetail.jsx` (uses fetch)
- `src/components/ReportCards.jsx` (uses both)

**16. Version-Control the Evaluation Prompt**

Move `EVALUATION_PROMPT` from `.env` to a versioned config file. Enables prompt A/B testing, rollback, and governance. Same for `INITIAL_PROMPT`, `INITIAL_PROMPT_V2`, `SCENARIO_PROMPT`.

**17. Replace SQLite** -- `socialflow-backend/app.py:46`

`sqlite:///social-flow.db` does not support concurrent writes. Combined with synchronous AI calls, the database locks under any meaningful load. Move to PostgreSQL.

**18. Fix React Query Cache Key** -- `src/components/ReportCards.jsx:101-104`

`queryKey: ['reportCards', user.token]` uses the JWT as a cache key. Invalidates on every login and leaks sensitive data to devtools. Use `user.id` instead.

**19. Fix GoalBasedObjectives Double-Fetch** -- `src/components/GoalBasedObjectives.jsx:72-79`

Sets `staleTime: 0` and `cacheTime: 0` then calls `refetch()` on mount. This completely negates React Query caching, causing a double-fetch every mount.

**20. Replace `window.location.href`** -- `src/components/Chat/Chat.jsx:347`

`window.location.href = reportLink` causes a full page reload, losing React state. Use React Router's `navigate()`.

**21. Fix Token Validation Double-Fallback** -- `src/contexts/AuthContext.jsx:24-37`

Tries `/api/protected/`, catches error, then tries `/api/auth/me/`. On network errors, accepts the token anyway. Fragile and adds latency.

**22. Diversify Scenario Library**

5 of 9 V1 scenarios are in coffee shops. Add scenarios with inherent social difficulty:
- A neighbor complaining about noise
- A colleague asking you to cover their shift
- Someone asking for directions when you are clearly lost yourself
- Sitting next to someone at a wedding who is clearly upset
- A friend who just got bad news

Zero code changes -- just new entries in `scenario.json`.

**23. Clean Up Dead Code**

Remove: `socialflow-backend/app_v1.py`, `socialflow-backend/validator.py` (Auth0), duplicate imports in `app.py` (json imported 3x, datetime 2x, Flask imported 2x).

---

## PRIORITY MATRIX

```
              HIGH IMPACT
                  |
    P0 FIXES      |    EMOTIONAL WEATHER
    (temp bug,     |    STAKES ENGINE
     timeouts,     |    IMPROV MODE
     async eval)   |
                   |
LOW EFFORT --------+---------- HIGH EFFORT
                   |
    QUICK WINS     |    ARCHITECTURE
    (kill counter, |    (PostgreSQL,
     fix avatar,   |     standardize HTTP,
     add scenarios)|     version prompts)
                   |
              LOW IMPACT
```

---

## QUICK WINS (Can Ship Today)

1. **Fix temperature bug** -- `socialflow-backend/utils.py:33` -- change `temperature:temperature` to `'temperature': temperature`
2. **Remove message counter** -- `src/components/Chat/Chat.jsx:542` -- delete the `(X/10)` display
3. **Kill motivational snackbar** -- `src/components/Chat/Chat.jsx:151-157` -- remove the "Keep going!" popup
4. **Replace game completion text** -- `socialflow-backend/app.py:561` -- use natural farewell
5. **Replace bot avatar** -- `src/components/Chat/MessageBubble.jsx:59` -- character initials instead of brain icon
6. **Replace "AI is typing"** -- `src/components/JustChat.jsx:284` -- use character name
7. **Add diverse scenarios** -- `socialflow-backend/scenario.json` -- new JSON entries, no code changes

---

## THE ONE-SENTENCE SUMMARY

> **SocialFlow currently treats social skill practice as a test to be graded; it should feel like a relationship to be navigated.**

Mission Control is the closest to the ideal product. Quick Bites is the furthest. The roadmap moves from fixing broken fundamentals (Phase 1), to removing "you're talking to a machine" signals (Phase 2), to making conversations genuinely unpredictable and consequential (Phase 3), to scaling the architecture for it (Phase 4).
