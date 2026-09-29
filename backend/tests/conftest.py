import pytest
from main import app
from auth import get_current_user, AuthUser

@pytest.fixture(autouse=True)
def override_auth():
    """Default fixture to authenticate requests in tests as test-user-id."""
    app.dependency_overrides[get_current_user] = lambda: AuthUser(
        id="test-user-id",
        email="test@cevonx.com",
        role="authenticated",
    )
    yield
    app.dependency_overrides.pop(get_current_user, None)
