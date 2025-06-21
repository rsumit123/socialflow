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
                "id": "a1b2c3d4-e5f6-...",
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
            },
            {
                "id": "f7g8h9i0-j1k2-...",
                "title": "The Coffee Shop Line",
                "context_description": "You are waiting in a long line at a coffee shop. The person in front of you seems impatient.",
                "user_goal": "Strike up a conversation and ask them what they recommend.",
                "difficulty_level": 2,
                "user_progress": {
                    "status": "Not Started",
                    "status_display": "Not Started",
                    "goal_achieved": false
                },
                "is_locked": true // This scenario is locked until "The Park Bench" is completed.
            }
        ]
    }
]
```

**Key fields for the frontend:**

*   `scenarios.is_locked`: Use this to show a lock icon or disable selection.
*   `scenarios.user_progress.status`: Shows whether the user has "Not Started", is "In Progress", or has "Completed" the scenario.
*   `scenarios.user_progress.goal_achieved`: Confirms successful completion.

---

### 2. Interacting with a Scenario (Start & Continue Chat)

This is the central endpoint for all turn-by-turn conversation within a scenario. Use it to send the user's first message and every subsequent message.

*   **Endpoint:** `POST /api/scenarios/{scenario_pk}/interact/`
*   **Method:** `POST`
*   **Description:** Sends the user's message to the AI persona and receives the character's response. After each turn, the backend checks if the user's goal has been met.

**Request Body:**

```json
{
    "user_input": "Good morning! It's a beautiful day, isn't it?"
}
```

**Success Response (200 OK):**

The response contains the AI's reply and, most importantly, the `goal_achieved` flag.

```json
{
    "ai_response": "It certainly is! The pigeons seem to be enjoying it.",
    "goal_achieved": false
}
```

---

### 3. How to Know When the Goal is Achieved

The frontend does **not** need to make a separate call to check for goal completion. This information is provided in every response from the `interact` endpoint.

**Workflow:**

1.  User sends a message to `POST /api/scenarios/{scenario_pk}/interact/`.
2.  The frontend receives the AI's response.
3.  **Check the `goal_achieved` flag in the JSON response.**
    *   If `false`, the conversation continues.
    *   If `true`, the conversation is over! The frontend should display a success message (e.g., "Goal Achieved!", "Mission Accomplished!"), and can now consider the scenario complete.

**Example "Goal Achieved" Response:**

```json
{
    "ai_response": "Oh, for breakfast? I had a lovely bowl of oatmeal with berries. Keeps me going all morning!",
    "goal_achieved": true
}
```

Upon receiving this, the UI should update to reflect completion. If the user reloads the scenario list, the progress for this scenario will now show as "Completed".

---

### 4. Fetching Progress for a Single Scenario (Optional)

If you need to check the progress of a specific scenario without fetching the entire list of paths (for example, on a dedicated scenario details page), you can use this endpoint.

*   **Endpoint:** `GET /api/scenarios/{scenario_pk}/progress/`
*   **Method:** `GET`
*   **Description:** Retrieves the detailed progress record for the current user and the specified scenario.

**Success Response (200 OK):**

```json
{
    "id": 123,
    "user": 1,
    "scenario": "a1b2c3d4-e5f6-...",
    "status": "CO",
    "status_display": "Completed",
    "goal_achieved": true,
    "total_score": null,
    "feedback": null
}
``` 