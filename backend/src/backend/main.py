from contextlib import asynccontextmanager
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from backend.database import Base, engine, get_db
from backend.models import PartyModel, utc_now

# Lifespan event to create database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

# App initialization
app = FastAPI(
    title="WaitEase Restaurant Waitlist API",
    description="Backend API for managing restaurant walk-in parties and waitlists.",
    version="1.0.0",
    lifespan=lifespan
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
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    party_size: int
    phone_number: Optional[str] = None
    notes: Optional[str] = None
    status: PartyStatus
    estimated_wait_minutes: int
    created_at: datetime
    updated_at: datetime

class PartyDetailResponse(PartyResponse):
    position: Optional[int] = None

class StatsResponse(BaseModel):
    active_parties: int
    total_guests_waiting: int
    avg_wait_minutes: int
    seated_today: int

@app.get("/")
def root():
    return {"message": "WaitEase API is running", "docs_url": "/docs"}

@app.get("/api/parties", response_model=List[PartyResponse])
def get_parties(status: Optional[str] = Query("ALL"), db: Session = Depends(get_db)):
    query = db.query(PartyModel)
    if status == "ACTIVE":
        query = query.filter(PartyModel.status.in_([PartyStatus.WAITING.value, PartyStatus.NOTIFIED.value]))
    elif status and status != "ALL":
        query = query.filter(PartyModel.status == status)

    return query.order_by(PartyModel.created_at.desc()).all()

@app.post("/api/parties", response_model=PartyResponse, status_code=status.HTTP_201_CREATED)
def create_party(party: PartyCreate, db: Session = Depends(get_db)):
    # Calculate default wait time if not provided
    active_waiting = db.query(PartyModel).filter(PartyModel.status == PartyStatus.WAITING.value).count()
    wait_time = (
        party.estimated_wait_minutes
        if party.estimated_wait_minutes is not None
        else max(10, (active_waiting + 1) * 10)
    )

    db_party = PartyModel(
        customer_name=party.customer_name,
        party_size=party.party_size,
        phone_number=party.phone_number or "",
        notes=party.notes or "",
        status=PartyStatus.WAITING.value,
        estimated_wait_minutes=wait_time,
        created_at=utc_now(),
        updated_at=utc_now()
    )
    db.add(db_party)
    db.commit()
    db.refresh(db_party)
    return db_party

@app.get("/api/parties/{party_id}", response_model=PartyDetailResponse)
def get_party(party_id: int, db: Session = Depends(get_db)):
    party = db.query(PartyModel).filter(PartyModel.id == party_id).first()
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")

    position = None
    if party.status in (PartyStatus.WAITING.value, PartyStatus.NOTIFIED.value):
        active_parties = (
            db.query(PartyModel)
            .filter(PartyModel.status.in_([PartyStatus.WAITING.value, PartyStatus.NOTIFIED.value]))
            .order_by(PartyModel.created_at.asc())
            .all()
        )
        for idx, p in enumerate(active_parties, start=1):
            if p.id == party_id:
                position = idx
                break

    # Build response
    resp = PartyDetailResponse.model_validate(party)
    resp.position = position
    return resp

@app.patch("/api/parties/{party_id}/status", response_model=PartyResponse)
def update_party_status(party_id: int, update: PartyStatusUpdate, db: Session = Depends(get_db)):
    party = db.query(PartyModel).filter(PartyModel.id == party_id).first()
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")

    party.status = update.status.value
    party.updated_at = utc_now()
    db.commit()
    db.refresh(party)
    return party

@app.delete("/api/parties/{party_id}")
def delete_party(party_id: int, db: Session = Depends(get_db)):
    party = db.query(PartyModel).filter(PartyModel.id == party_id).first()
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")

    db.delete(party)
    db.commit()
    return {"success": True, "deleted_id": party_id}

@app.get("/api/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    active = (
        db.query(PartyModel)
        .filter(PartyModel.status.in_([PartyStatus.WAITING.value, PartyStatus.NOTIFIED.value]))
        .all()
    )
    seated_count = db.query(PartyModel).filter(PartyModel.status == PartyStatus.SEATED.value).count()

    total_guests = sum(p.party_size for p in active)
    avg_wait = int(sum(p.estimated_wait_minutes for p in active) / len(active)) if active else 0

    return {
        "active_parties": len(active),
        "total_guests_waiting": total_guests,
        "avg_wait_minutes": avg_wait,
        "seated_today": seated_count
    }
