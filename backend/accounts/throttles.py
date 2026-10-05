from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Apply a dedicated per-IP limit to unauthenticated login attempts."""

    scope = "login"
