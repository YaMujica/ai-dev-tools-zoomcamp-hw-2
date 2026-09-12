# WaitEase - Restaurant Waitlist Manager

> AI-assisted full-stack application built for **Homework 2** of the **AI Dev Tools Zoomcamp** (DataTalksClub).

WaitEase is a modern, lightweight restaurant waitlist management application. It equips restaurant hosts with an interactive real-time queue management dashboard and provides guests with a mobile-friendly tracking status page.

## Project Structure
```text
hw-2/
├── _docs/
│   ├── specs.md       # Product specifications and data models
│   └── openapi.yaml   # OpenAPI 3.0 API schema
├── frontend/          # Node.js + React (Vite) client
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddPartyModal.jsx
│   │   │   ├── GuestViewModal.jsx
│   │   │   ├── PartyCard.jsx
│   │   │   └── StatsBar.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
├── backend/           # FastAPI backend with SQLAlchemy and uv
│   ├── src/
│   │   └── backend/
│   │       ├── database.py
│   │       ├── models.py
│   │       └── main.py
│   ├── tests/
│   │   └── test_api.py
│   └── pyproject.toml
├── AGENTS.md          # Instructions for AI coding assistants
└── README.md
```

---

## Quickstart Guide

### 1. Start Backend (FastAPI + SQLAlchemy)
From the `backend` directory:
```bash
# Run database migrations / start server
uv run uvicorn backend.main:app --reload --port 8000
```
Interactive OpenAPI Swagger docs are available at: `http://localhost:8000/docs`

### 2. Run Backend Tests
From the `backend` directory:
```bash
uv run pytest
```

### 3. Start Frontend (React + Vite)
From the `frontend` directory:
```bash
# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## Features
- **Host Dashboard**:
  - Add walk-in parties with party size, phone number, and special requests.
  - Live queue lifecycle: `WAITING` ➔ `NOTIFIED` ➔ `SEATED` / `CANCELLED`.
  - Filter parties by `Active Queue`, `Waiting`, `Notified`, `Seated`, or `All`.
  - Real-time KPI summary (parties waiting, total guests, average wait time, seated count).
- **Guest Live Status View**:
  - Modal simulator and dedicated view for waiting guests showing exact place in line and estimated wait time remaining.
- **Database Persistence**:
  - Powered by SQLAlchemy ORM with SQLite backend (database-agnostic).
- **Automated Tests**:
  - Full test coverage for all endpoints and status transitions using `pytest`.
