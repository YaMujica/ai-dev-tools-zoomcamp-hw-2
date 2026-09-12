import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.database import Base, get_db
from backend.main import app

# Test database: isolated SQLite in-memory
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

def test_initial_parties_empty():
    response = client.get("/api/parties")
    assert response.status_code == 200
    assert response.json() == []

def test_create_party_success():
    payload = {
        "customer_name": "Sarah Connor",
        "party_size": 3,
        "phone_number": "+15551234567",
        "notes": "Booth preferred",
        "estimated_wait_minutes": 25
    }
    response = client.post("/api/parties", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["customer_name"] == "Sarah Connor"
    assert data["party_size"] == 3
    assert data["status"] == "WAITING"
    assert data["estimated_wait_minutes"] == 25
    assert "created_at" in data

def test_create_party_validation():
    # party_size below 1
    res = client.post("/api/parties", json={"customer_name": "Ghost", "party_size": 0})
    assert res.status_code == 422

    # customer_name empty
    res2 = client.post("/api/parties", json={"customer_name": "", "party_size": 2})
    assert res2.status_code == 422

def test_get_party_detail_and_position():
    # Create two parties
    p1 = client.post("/api/parties", json={"customer_name": "First Guest", "party_size": 2}).json()
    p2 = client.post("/api/parties", json={"customer_name": "Second Guest", "party_size": 4}).json()

    # Verify positions in line
    res1 = client.get(f"/api/parties/{p1['id']}")
    assert res1.status_code == 200
    assert res1.json()["position"] == 1

    res2 = client.get(f"/api/parties/{p2['id']}")
    assert res2.status_code == 200
    assert res2.json()["position"] == 2

def test_status_lifecycle():
    # Create party
    party = client.post("/api/parties", json={"customer_name": "Ellen Ripley", "party_size": 4}).json()
    party_id = party["id"]
    assert party["status"] == "WAITING"

    # Notify
    patch_res = client.patch(f"/api/parties/{party_id}/status", json={"status": "NOTIFIED"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "NOTIFIED"

    # Seat
    seat_res = client.patch(f"/api/parties/{party_id}/status", json={"status": "SEATED"})
    assert seat_res.status_code == 200
    assert seat_res.json()["status"] == "SEATED"

    # Seated party should no longer have a queue position
    detail = client.get(f"/api/parties/{party_id}").json()
    assert detail["position"] is None

def test_status_filtering():
    client.post("/api/parties", json={"customer_name": "Waiting One", "party_size": 2})
    p2 = client.post("/api/parties", json={"customer_name": "Notified One", "party_size": 3}).json()
    p3 = client.post("/api/parties", json={"customer_name": "Seated One", "party_size": 4}).json()

    client.patch(f"/api/parties/{p2['id']}/status", json={"status": "NOTIFIED"})
    client.patch(f"/api/parties/{p3['id']}/status", json={"status": "SEATED"})

    # Active filter should return WAITING and NOTIFIED (2 parties)
    active_res = client.get("/api/parties?status=ACTIVE")
    assert len(active_res.json()) == 2

    # Seated filter should return 1 party
    seated_res = client.get("/api/parties?status=SEATED")
    assert len(seated_res.json()) == 1
    assert seated_res.json()[0]["customer_name"] == "Seated One"

def test_delete_party():
    party = client.post("/api/parties", json={"customer_name": "Luke Skywalker", "party_size": 1}).json()
    party_id = party["id"]

    del_res = client.delete(f"/api/parties/{party_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Ensure 404 after deletion
    get_res = client.get(f"/api/parties/{party_id}")
    assert get_res.status_code == 404

def test_stats_metrics():
    # 2 waiting, 1 seated
    p1 = client.post("/api/parties", json={"customer_name": "P1", "party_size": 2, "estimated_wait_minutes": 10}).json()
    p2 = client.post("/api/parties", json={"customer_name": "P2", "party_size": 4, "estimated_wait_minutes": 20}).json()
    p3 = client.post("/api/parties", json={"customer_name": "P3", "party_size": 2, "estimated_wait_minutes": 15}).json()

    client.patch(f"/api/parties/{p3['id']}/status", json={"status": "SEATED"})

    stats = client.get("/api/stats").json()
    assert stats["active_parties"] == 2
    assert stats["total_guests_waiting"] == 6
    assert stats["avg_wait_minutes"] == 15
    assert stats["seated_today"] == 1
