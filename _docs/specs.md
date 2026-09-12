# WaitEase - Restaurant Waitlist Manager Specification

## 1. Executive Summary & Vision
WaitEase is a modern, lightweight, full-stack restaurant waitlist management application designed to replace paper clipboards, physical pagers, and manual queue tracking. It empowers restaurant hosts to manage walk-in queues effortlessly while giving waiting guests real-time visibility into their position in line and estimated wait times.

---

## 2. Target Users & User Personas
1. **Restaurant Host / Hostess (Staff)**:
   - Needs a fast, one-handed / desktop-friendly dashboard to register walk-in parties quickly.
   - Needs clear visual cues for party status, wait times, and party sizes.
   - Needs one-click actions to notify guests, seat them, or remove no-shows.
2. **Dining Guests**:
   - Needs a lightweight mobile-friendly status screen to check their place in line without having to hover near the host stand.

---

## 3. Core Features & User Stories

### US-1: Add Party to Waitlist (Host)
- Quick entry form with:
  - **Guest Name** (Required)
  - **Party Size** (Required, integer 1–20)
  - **Phone Number** (Optional, for notifications)
  - **Special Requests / Notes** (Optional, e.g., "Highchair needed", "Patio seating")
  - **Estimated Wait Time** (Calculated automatically or manually editable in minutes)

### US-2: Live Queue Management (Host)
- Party status lifecycle:
  - `WAITING`: Waiting for an available table.
  - `NOTIFIED`: Staff has alerted the party that their table is ready.
  - `SEATED`: Party has been seated.
  - `CANCELLED`: Party cancelled or was marked as a no-show.
- Action triggers per party card/row:
  - **Notify**: Changes status to `NOTIFIED`.
  - **Seat**: Changes status to `SEATED`.
  - **Cancel / Remove**: Changes status to `CANCELLED`.
- Filter tabs: **Active Queue** (`WAITING` + `NOTIFIED`), **Seated**, **All**.

### US-3: Queue Summary & Analytics (Host)
- Top KPI summary bar:
  - Parties Waiting
  - Total Guests Waiting
  - Estimated Average Wait Time
  - Parties Seated Today

### US-4: Guest Status View (Guest)
- Accessible by party ID (e.g. `/guest/:id`):
  - Displays party name and size.
  - Displays real-time status badge ("In Line", "Table Ready!").
  - Displays current position in queue (e.g. *"You are #2 in line"*).
  - Estimated wait time remaining.

---

## 4. Data Model (`WaitlistEntry`)

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment | Unique party identifier |
| `customer_name` | String | Non-empty, max 100 chars | Name of the reservation/walk-in |
| `party_size` | Integer | Min: 1, Max: 20 | Number of diners |
| `phone_number` | String | Optional, max 20 chars | Guest contact phone |
| `notes` | String | Optional, max 255 chars | Dietary, seating, or accessibility notes |
| `status` | Enum | `WAITING`, `NOTIFIED`, `SEATED`, `CANCELLED` | Default: `WAITING` |
| `estimated_wait_minutes` | Integer | Min: 0 | Estimated wait in minutes |
| `created_at` | DateTime (UTC) | Default: now | Timestamp when party was added |
| `updated_at` | DateTime (UTC) | Default: now, auto-update | Last status change timestamp |

---

## 5. API Endpoints Contract (OpenAPI)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/parties` | Add a new party to the waitlist |
| `GET` | `/api/parties` | List parties (filterable by status) |
| `GET` | `/api/parties/{id}` | Get party details (used by host & guest view) |
| `PATCH` | `/api/parties/{id}/status` | Update party status (`NOTIFIED`, `SEATED`, `CANCELLED`) |
| `DELETE` | `/api/parties/{id}` | Delete a party record |
| `GET` | `/api/stats` | Retrieve queue metrics (total waiting, seated, avg wait) |

---

## 6. Architecture & Tech Stack
- **Frontend**: Node.js + React (Vite) with responsive, modern styling.
- **Backend**: Python 3.11+ with FastAPI, managed using Astral `uv`.
- **Database**: SQLAlchemy ORM (SQLite for local development).
- **Testing**: `pytest` for backend API endpoint test coverage.
