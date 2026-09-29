import pytest
from fastapi.testclient import TestClient
from main import app
from auth import get_current_user, AuthUser
import db
import json

client = TestClient(app)

def test_missing_auth_returns_401():
    """Verify that unauthenticated requests to protected endpoints return 401."""
    # Temporarily remove dependency override
    app.dependency_overrides.pop(get_current_user, None)
    try:
        response = client.get("/history")
        assert response.status_code == 401
        assert "Missing authentication token" in response.json()["detail"]

        review_res = client.get("/review")
        assert review_res.status_code == 401

        image_res = client.get("/documents/dummy-doc/image")
        assert image_res.status_code == 401
    finally:
        # Restore fixture override
        app.dependency_overrides[get_current_user] = lambda: AuthUser(
            id="test-user-id", email="test@cevonx.com", role="authenticated"
        )


def test_user_data_isolation():
    """Verify that User A cannot see or modify User B's documents."""
    user_a = AuthUser(id="user-a-111", email="a@cevonx.com", role="authenticated")
    user_b = AuthUser(id="user-b-222", email="b@cevonx.com", role="authenticated")

    doc_id = "doc-user-a-secret"
    payload = json.dumps({"vendor": "Acme User A Corp", "total": 250.0, "currency": "USD"})

    # User A inserts a document
    db.insert_document(
        doc_id=doc_id,
        filename="user_a_receipt.png",
        status="pending_review",
        extracted_json=payload,
        created_at="2026-09-29T12:00:00Z",
        user_id=user_a.id,
    )

    # 1. As User A: verify document appears in history and review
    app.dependency_overrides[get_current_user] = lambda: user_a
    res_a_hist = client.get("/history")
    assert res_a_hist.status_code == 200
    docs_a = [d["id"] for d in res_a_hist.json()["documents"]]
    assert doc_id in docs_a

    res_a_rev = client.get(f"/review?document_id={doc_id}")
    assert res_a_rev.status_code == 200
    assert len(res_a_rev.json()["documents"]) == 1

    # 2. Switch to User B: verify User A's document is NOT visible
    app.dependency_overrides[get_current_user] = lambda: user_b
    res_b_hist = client.get("/history")
    assert res_b_hist.status_code == 200
    docs_b = [d["id"] for d in res_b_hist.json()["documents"]]
    assert doc_id not in docs_b

    res_b_rev = client.get(f"/review?document_id={doc_id}")
    assert res_b_rev.status_code == 200
    assert len(res_b_rev.json()["documents"]) == 0

    # 3. User B attempts to approve User A's document -> 404 access denied
    approve_res = client.post(
        "/approve",
        json={"document_id": doc_id, "reviewed_data": {"vendor": "Hacked", "total": 0.0}}
    )
    assert approve_res.status_code == 404
    assert "not found or access denied" in approve_res.json()["detail"].lower()

    # 4. User B attempts to get User A's document image -> 404 access denied
    img_res = client.get(f"/documents/{doc_id}/image")
    assert img_res.status_code == 404
    assert "not found or access denied" in img_res.json()["detail"].lower()
