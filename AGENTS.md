# AGENTS.md - Instructions for AI Coding Assistants

## Project Overview
This repository contains **WaitEase**, a full-stack restaurant waitlist manager built as part of the AI Dev Tools Zoomcamp.
The project follows a **spec-driven development** workflow.

## Project Structure
```text
hw-2/
├── _docs/
│   ├── specs.md       # Product specifications and data models
│   └── openapi.yaml   # OpenAPI 3.0 API schema
├── frontend/          # Node.js + React (Vite) client
├── backend/           # FastAPI backend managed with Astral `uv`
├── AGENTS.md          # This file
└── README.md
```

## Guidelines for Agents
1. **Source of Truth**:
   - Follow `_docs/specs.md` for functional requirements and data contracts.
   - Maintain API consistency with `_docs/openapi.yaml`.
2. **Backend**:
   - Use `uv` for Python dependency management.
   - Framework: **FastAPI** with Pydantic v2 schemas.
   - Database: **SQLAlchemy** (database-agnostic, using SQLite for local environment).
   - Write endpoint tests first with `pytest`.
3. **Frontend**:
   - Scaffold using Node.js and React (Vite).
   - Keep API calls modular and centralized (e.g., in `src/api.js` or `src/services/api.ts`).
   - Use mock adapters initially when building the prototype, then seamlessly swap to live HTTP requests.
4. **Testing**:
   - Ensure all automated tests pass before finalizing tasks.
