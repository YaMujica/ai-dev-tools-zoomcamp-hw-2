from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# App initialization
app = FastAPI(
    title="WaitEase Restaurant Waitlist API",
    description="Backend API for managing restaurant walk-in parties and waitlists.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums and Schemas
class PartyStatus(str, Enum):
    WAITING = "WAITING"
    NOTIFIED = "NOTIFIED"
    SEATED = "SEATED"
    CANCELLED = "CANCELLED"

class PartyCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=100)
    party_size: int = Field(..., ge=1, le=20)
    phone_number: Optional[str] = Field(None, max_length=20)
    notes: Optional[str] = Field(None, max_length=255)
    estimated_wait_minutes: Optional[int] = Field(None, ge=0)

class PartyStatusUpdate(BaseModel):
    status: PartyStatus

class PartyResponse(BaseModel):
    id: int
    customer_name: str
    party_size: int
    phone_number: Optional[str] = None
    notes: Optional[str] = None
    status: PartyStatus
    estimated_wait_minutes: int
    created_at: str
    updated_at: str

class PartyDetailResponse(PartyResponse):
    position: Optional[int] = None

class StatsResponse(BaseModel):
    active_parties: int
    total_guests_waiting: int
    avg_wait_minutes: int
    seated_today: int

# In-Memory Mock Database
mock_parties_db: List[dict] = []
next_id_counter = 1

def reset_db():
    global mock_parties_db, next_id_counter
    mock_parties_db = []
    next_id_counter = 1

@app.get("/")
def root():
    return {"message": "WaitEase API is running", "docs_url": "/docs"}

@app.get("/api/parties", response_model=List[PartyResponse])
def get_parties(status: Optional[str] = Query("ALL")):
    if status == "ACTIVE":
        return [p for p in mock_parties_db if p["status"] in (PartyStatus.WAITING.value, PartyStatus.NOTIFIED.value)]
    if status and status != "ALL":
        return [p for p in mock_parties_db if p["status"] == status]
    return mock_parties_db

@app.post("/api/parties", response_model=PartyResponse, status_code=status.HTTP_201_CREATED)
def create_party(party: PartyCreate):
    global next_id_counter
    now_iso = datetime.now(timezone.utc).isoformat()

    # Calculate default wait time if not supplied
    active_waiting = len([p for p in mock_parties_db if p["status"] == PartyStatus.WAITING.value])
    wait_time = party.estimated_wait_minutes if party.estimated_wait_minutes is not None else max(10, (active_waiting + 1) * 10)

    new_party = {
        "id": next_id_counter,
        "customer_name": party.customer_name,
        "party_size": party.party_size,
        "phone_number": party.phone_number or "",
        "notes": party.notes or "",
        "status": PartyStatus.WAITING.value,
        "estimated_wait_minutes": wait_time,
        "created_at": now_iso,
        "updated_at": now_iso
    }
    next_id_counter += 1
    mock_parties_db.insert(0, new_party)
    return new_party

@app.get("/api/parties/{party_id}", response_model=PartyDetailResponse)
def get_party(party_id: int):
    party = next((p for p in mock_parties_db if p["id"] == party_id), None)
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")

    # Compute line position among active parties
    active = [p for p in mock_parties_db if p["status"] in (PartyStatus.WAITING.value, PartyStatus.NOTIFIED.value)]
    position = None
    for idx, p in enumerate(reversed(active), start=1):
        if p["id"] == party_id:
            position = idx
            break

    # If it's active but we ordered by insertion:
    # Actually, active parties position is order of creation (oldest waiting is #1)
    sorted_active = sorted(active, key=lambda x: x["created_at"])
    for idx, p in enumerate(sorted_active, start=1):
        if p["id"] == party_id:
            position = idx
            break

    return {**party, "position": position}

@app.patch("/api/parties/{party_id}/status", response_model=PartyResponse)
def update_party_status(party_id: int, update: PartyStatusUpdate):
    party = next((p for p in mock_parties_db if p["id"] == party_id), None)
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")

    party["status"] = update.status.value
    party["updated_at"] = datetime.now(timezone.utc).isoformat()
    return party

@app.delete("/api/parties/{party_id}")
def delete_party(party_id: int):
    global mock_parties_db
    party = next((p for p in mock_parties_db if p["id"] == party_id), None)
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")

    mock_parties_db = [p for p in mock_parties_db if p["id"] != party_id]
    return {"success": True, "deleted_id": party_id}

@app.get("/api/stats", response_model=StatsResponse)
def get_stats():
    active = [p for p in mock_parties_db if p["status"] in (PartyStatus.WAITING.value, PartyStatus.NOTIFIED.value)]
    seated = [p for p in mock_parties_db if p["status"] == PartyStatus.SEATED.value]

    total_guests = sum(p["party_size"] for p in active)
    avg_wait = int(sum(p["estimated_wait_minutes"] for p in active) / len(active)) if active else 0

    return {
        "active_parties": len(active),
        "total_guests_waiting": total_guests,
        "avg_wait_minutes": avg_wait,
        "seated_today": len(seated)
    }
