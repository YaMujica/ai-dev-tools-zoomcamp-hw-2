from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from backend.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class PartyModel(Base):
    __tablename__ = "parties"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_name = Column(String(100), nullable=False)
    party_size = Column(Integer, nullable=False)
    phone_number = Column(String(20), nullable=True, default="")
    notes = Column(String(255), nullable=True, default="")
    status = Column(String(20), nullable=False, default="WAITING", index=True)
    estimated_wait_minutes = Column(Integer, nullable=False, default=15)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
