from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_shared_response_envelope() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"data": {"status": "ok"}, "message": None, "request_id": None}


def test_root_describes_api() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["docs"] == "/docs"
