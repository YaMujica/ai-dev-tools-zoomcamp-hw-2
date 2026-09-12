import pytest
from fastapi.testclient import TestClient
from backend.main import app, reset_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    reset_db()
    yield

def test_initial_parties_list():
    response = client.get("/api/parties")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_party():
    payload = {
        "customer_name": "Sarah Connor",
        "party_size": 3,
        "phone_number": "+15551234567",
        "notes": "Booth preferred",
        "estimated_wait_minutes": 20
    }
    response = client.post("/api/parties", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["customer_name"] == "Sarah Connor"
    assert data["party_size"] == 3
    assert data["status"] == "WAITING"
    assert data["estimated_wait_minutes"] == 20

def test_get_party_detail():
    # Create party
    res = client.post("/api/parties", json={
        "customer_name": "James Bond",
        "party_size": 2
    })
    party_id = res.json()["id"]

    # Fetch detail
    detail_res = client.get(f"/api/parties/{party_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == party_id
    assert detail["customer_name"] == "James Bond"
    assert detail["position"] == 1

def test_update_party_status():
    # Create party
    res = client.post("/api/parties", json={
        "customer_name": "Ellen Ripley",
        "party_size": 4
    })
    party_id = res.json()["id"]

    # Notify
    patch_res = client.patch(f"/api/parties/{party_id}/status", json={"status": "NOTIFIED"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "NOTIFIED"

    # Seat
    seat_res = client.patch(f"/api/parties/{party_id}/status", json={"status": "SEATED"})
    assert seat_res.status_code == 200
    assert seat_res.json()["status"] == "SEATED"

def test_delete_party():
    res = client.post("/api/parties", json={
        "customer_name": "Luke Skywalker",
        "party_size": 1
    })
    party_id = res.json()["id"]

    del_res = client.delete(f"/api/parties/{party_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Ensure not found
    get_res = client.get(f"/api/parties/{party_id}")
    assert get_res.status_code == 404

def test_stats_endpoint():
    # Add two waiting and seat one
    p1 = client.post("/api/parties", json={"customer_name": "Party 1", "party_size": 2}).json()
    p2 = client.post("/api/parties", json={"customer_name": "Party 2", "party_size": 4}).json()
    p3 = client.post("/api/parties", json={"customer_name": "Party 3", "party_size": 3}).json()

    client.patch(f"/api/parties/{p3['id']}/status", json={"status": "SEATED"})

    stats_res = client.get("/api/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["active_parties"] == 2
    assert stats["total_guests_waiting"] == 6
    assert stats["seated_today"] == 1
