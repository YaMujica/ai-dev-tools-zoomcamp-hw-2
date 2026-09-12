# WaitEase - Restaurant Waitlist Manager

> AI-assisted full-stack application built for **Homework 2** of the **AI Dev Tools Zoomcamp** (DataTalksClub).

WaitEase is a modern, lightweight restaurant waitlist management application. It equips restaurant hosts with an interactive real-time queue management dashboard and provides guests with a mobile-friendly tracking status page.

## Project Structure
```text
hw-2/
├── _docs/
│   └── specs.md       # Product specifications and data models
├── frontend/          # Node.js / React frontend
├── backend/           # FastAPI / Python backend with uv
├── AGENTS.md          # Guide for AI coding agents working on this project
└── README.md
```

## Features
- **Host Dashboard**:
  - Add parties with custom party sizes, contact phone, and notes.
  - Live waitlist with party status lifecycle: `WAITING` -> `NOTIFIED` -> `SEATED` / `CANCELLED`.
  - Filter parties by active status or history.
  - Real-time KPI summary (parties waiting, total guests, average wait time, seated count).
- **Guest Status View**:
  - Live link for guests to check their position in line and estimated wait time remaining.

## Tech Stack
- **Frontend**: Node.js + React (Vite)
- **Backend**: FastAPI with Python (`uv` package manager)
- **Database**: SQLAlchemy ORM with SQLite
- **API Spec**: OpenAPI 3.0
- **Testing**: `pytest`

## Getting Started
Detailed setup instructions for both frontend and backend will be documented as each module is implemented.
