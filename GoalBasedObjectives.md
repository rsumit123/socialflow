# API Documentation: Goal-Based Scenario Engine

This document outlines the API endpoints and data formats for the interactive, goal-based scenario feature.

### Authentication

All endpoints require an `Authorization` header with a Bearer token.

**Header Format:**
`Authorization: Bearer <your_jwt_token>`

---

### 1. Listing All Learning Paths and Scenarios

To get a list of all available learning paths and their containing scenarios (goals), use this endpoint. It provides all the necessary information to build a scenario selection screen, including the user's current progress and whether a scenario is locked or unlocked.

*   **Endpoint:** `GET /api/scenarios/paths/`
*   **Method:** `GET`
*   **Description:** Retrieves a list of all learning paths. Each path includes its scenarios, and each scenario includes the user's most relevant progress status.

#### User Progress Logic
The `user_progress` object for each scenario now shows the most relevant attempt:
- If a scenario is currently **in progress**, `user_progress` will reflect that attempt.
- If a scenario has been completed one or more times, `user_progress` will reflect the attempt with the **highest score**.
- If a scenario has not been started, `user_progress` will be `null`.

**Success Response (200 OK):**

```json
[
    {
        "id": 1,
        "name": "Mastering Small Talk",
        "description": "Learn the art of initiating and holding light, engaging conversations.",
        "scenarios": [
            {
                "id": 1,
                "title": "The Park Bench",
                "context_description": "An old man is sitting on a park bench, feeding pigeons. He looks friendly.",
                "user_goal": "Find out what the old man ate for breakfast in a natural, smooth conversation.",
                "difficulty_level": 1,
                "user_progress": {
                    "id": 124,
                    "status": "CO",
                    "status_display": "Completed",
                    "goal_achieved": true,
                    "total_score": 95
                },
                "is_locked": false
            }
        ]
    }
]
```

**Key fields for the frontend:**

*   `scenarios.id`: Use this integer ID to construct the interaction URL.
*   `scenarios.is_locked`: Use this to show a lock icon or disable selection.
*   `scenarios.user_progress`: Display the status and score from this object. It will always show the most relevant attempt (in-progress or best score).

---

### 2. Interacting with a Scenario (Replayable)

This is the central endpoint for all turn-by-turn conversation. It now fully supports **replayability**.

*   **Endpoint:** `POST /api/scenarios/{id}/interact/`
*   **Method:** `POST`
*   **Description:**
    - If the user has an 'In Progress' attempt for this scenario, it continues that conversation.
    - If the user has no 'In Progress' attempts (i.e., they are all 'Completed' or 'Failed'), this will **start a new attempt**. This allows the user to replay scenarios to improve their score.
*   **The response now includes:** the character's reply, a **detailed feedback analysis**, a concise **real-time tip**, a `goal_achieved` flag, and a final score upon completion.

**Request Body:**

```json
{
    "user_input": "Good morning! It's a beautiful day, isn't it?"
}
```

**Success Response (In-Progress):**
The `feedback` is now a more detailed, educational analysis based on social skills principles. The `real_time_tip` is a short, actionable version suitable for quick display.

```json
{
    "ai_response": "It certainly is! The pigeons seem to be enjoying it.",
    "goal_achieved": false,
    "feedback": "Good start using an open-ended question! As Debra Fine suggests in 'The Fine Art of Small Talk', this invites more than a simple yes/no answer and gets the conversation going.",
    "score": null,
    "real_time_tip": "Great start! Keep it open."
}
```

---

### 3. Fetching Chat History for an In-Progress Scenario

Before a user starts interacting with a scenario, the UI should call this endpoint to fetch the chat history. This ensures that if they are returning to an unfinished attempt, the previous messages are displayed.

*   **Endpoint:** `GET /api/scenarios/{id}/history/`
*   **Method:** `GET`
*   **Description:** Retrieves the chat history (user and assistant messages) for the user's current 'In Progress' attempt for a specific scenario. If no 'In Progress' attempt exists, it returns an empty list. Each user message now includes the detailed feedback, score, and tip that was provided for that specific turn.

**Success Response (200 OK):**
An array of chat message objects. Note how the `feedback` fields are `null` for the assistant's turn.

```json
[
    {
        "role": "user",
        "content": "Good morning! It's a beautiful day, isn't it?",
        "timestamp": "2025-06-21T10:30:00Z",
        "feedback": "Good start using an open-ended question! As Debra Fine suggests...",
        "score": 70,
        "real_time_tip": "Great start! Keep it open."
    },
    {
        "role": "assistant",
        "content": "It certainly is! The pigeons seem to be enjoying it.",
        "timestamp": "2025-06-21T10:30:05Z",
        "feedback": null,
        "score": null,
        "real_time_tip": null
    }
]
```

---

### 4. How to Know When the Goal is Achieved

The frontend does **not** need to make a separate call. The `interact` endpoint provides all necessary information on every turn.

**UI Workflow:**

1.  When a user enters a scenario screen, call the `GET .../history/` endpoint to load the conversation.
2.  User sends a new message using `POST .../interact/`.
3.  The frontend receives the response from the `interact` call.
4.  **Display the `real_time_tip` string** to the user as a quick coaching hint.
5.  Optionally, make the full `feedback` available in a different UI element (e.g., a "Details" button or a collapsible section).
6.  **Check the `goal_achieved` flag:**
    *   If `false`, the conversation continues.
    *   If `true`, the current attempt is over. The UI should display a success message and the final `score`.

**Example "Goal Achieved" Response:**

```json
{
    "ai_response": "Oh, for breakfast? I had a lovely bowl of oatmeal with berries. Keeps me going all morning!",
    "goal_achieved": true,
    "feedback": "Excellent! You successfully found out the goal. Your use of 'strategic questioning' after building rapport was key to getting Arthur to open up comfortably.",
    "score": 95,
    "real_time_tip": "Goal achieved! Great strategy."
}
```

---

### 5. Fetching All Progress for a Scenario (History)

To view a user's complete history for a single scenario (e.g., to show a list of all past scores), you can now use this endpoint.

*   **Endpoint:** `GET /api/scenarios/{scenario_id}/progress/`
*   **Method:** `GET`
*   **Description:** Retrieves a list of all progress records (all attempts) for the current user and the specified scenario.

**Success Response (200 OK):**

```json
[
    {
        "id": 124,
        "user": 1,
        "scenario": 1,
        "status": "CO",
        "status_display": "Completed",
        "goal_achieved": true,
        "total_score": 95,
        "feedback": "Excellent work! You extracted the information smoothly."
    },
    {
        "id": 101,
        "user": 1,
        "scenario": 1,
        "status": "CO",
        "status_display": "Completed",
        "goal_achieved": true,
        "total_score": 82,
        "feedback": "A good attempt, you got the information!"
    }
]
```

---

### 6. Force-Completing a Scenario (Manual Override)

If a user feels they have completed the goal but the automatic detection has not triggered, they can use this endpoint to manually end their **current in-progress attempt** and receive a final evaluation.

*   **Endpoint:** `POST /api/scenarios/{scenario_id}/force-complete/`
*   **Method:** `POST`
*   **Description:** Manually triggers a final evaluation of the current in-progress conversation. It marks the attempt as completed and generates a final score and feedback.
*   **Request Body:** (Empty)

**Success Response (200 OK):**

The response provides the final evaluation from the AI coach for the current attempt.

```json
{
    "goal_achieved": true,
    "feedback": "You did a great job building rapport before asking for the information.",
    "score": 92
}
``` 