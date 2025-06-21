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
*   **Description:** Retrieves a list of all learning paths. Each path includes its scenarios, and each scenario includes the current user's progress and lock status.

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
                    "status": "In Progress",
                    "status_display": "In Progress",
                    "goal_achieved": false
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
*   `scenarios.user_progress.status`: Shows whether the user has "Not Started", is "In Progress", or has "Completed" the scenario.

---

### 2. Interacting with a Scenario (Start & Continue Chat)

This is the central endpoint for all turn-by-turn conversation within a scenario. Use it to send the user's first message and every subsequent message. The response now includes real-time coaching feedback on every turn.

*   **Endpoint:** `POST /api/scenarios/{scenario_id}/interact/`
*   **Method:** `POST`
*   **Description:** Sends the user's message to the AI persona. The response includes the character's reply, a real-time feedback tip, a `goal_achieved` flag, and a final score upon completion.

**Request Body:**

```json
{
    "user_input": "Good morning! It's a beautiful day, isn't it?"
}
```

**Success Response (200 OK):**

The response contains the AI's reply, the `goal_achieved` flag, and the new `feedback` and `score` fields.

```json
{
    "ai_response": "It certainly is! The pigeons seem to be enjoying it.",
    "goal_achieved": false,
    "feedback": "You're building good rapport with Arthur.",
    "score": null
}
```

---

### 3. How to Know When the Goal is Achieved

The frontend does **not** need to make a separate call. The `interact` endpoint provides all necessary information on every turn.

**UI Workflow:**

1.  User sends a message to `POST /api/scenarios/{scenario_id}/interact/`.
2.  The frontend receives the response.
3.  **Display the `feedback` string** to the user as a real-time coaching tip. This provides continuous guidance.
4.  **Check the `goal_achieved` flag:**
    *   If `false`, the conversation continues. The UI is ready for the next user input.
    *   If `true`, the conversation is over! The UI should display a success message (e.g., "Goal Achieved!"), show the final `feedback` and `score`, and perhaps provide an option to move to the next scenario.

**Example "Goal Achieved" Response:**

```json
{
    "ai_response": "Oh, for breakfast? I had a lovely bowl of oatmeal with berries. Keeps me going all morning!",
    "goal_achieved": true,
    "feedback": "Excellent work! You extracted the information smoothly.",
    "score": 95
}
```

Upon receiving this, the UI should update to reflect completion. If the user reloads the scenario list, the progress for this scenario will now show as "Completed".

---

### 4. Fetching Progress for a Single Scenario (Optional)

If you need to check the progress of a specific scenario without fetching the entire list of paths (for example, on a dedicated scenario details page), you can use this endpoint.

*   **Endpoint:** `GET /api/scenarios/{scenario_id}/progress/`
*   **Method:** `GET`
*   **Description:** Retrieves the detailed progress record for the current user and the specified scenario, including final score and feedback if completed.

**Success Response (200 OK):**

```json
{
    "id": 123,
    "user": 1,
    "scenario": 1,
    "status": "CO",
    "status_display": "Completed",
    "goal_achieved": true,
    "total_score": 95,
    "feedback": "Excellent work! You extracted the information smoothly."
}
```

---

### 5. Force-Completing a Scenario (Manual Override)

If a user feels they have completed the goal but the automatic detection has not triggered, they can use this endpoint to manually end the scenario and receive a final evaluation.

*   **Endpoint:** `POST /api/scenarios/{scenario_id}/force-complete/`
*   **Method:** `POST`
*   **Description:** Manually triggers a final evaluation of the conversation. This should be used when the user decides the goal is complete. It marks the scenario as completed and generates a final score and feedback.
*   **Request Body:** (Empty)

**Success Response (200 OK):**

The response provides the final evaluation from the AI coach.

```json
{
    "goal_achieved": true,
    "feedback": "You did a great job building rapport before asking for the information.",
    "score": 92
}
``` 