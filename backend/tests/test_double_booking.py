import pytest
from app.services.booking_logic import VALID_TRANSITIONS, validate_status_transition
from fastapi import HTTPException

def test_booking_status_transitions():
    # Valid transitions
    validate_status_transition("PENDING", "ACCEPTED", "PROVIDER")
    validate_status_transition("PENDING", "REJECTED", "PROVIDER")
    validate_status_transition("PENDING", "CANCELLED", "CUSTOMER")
    validate_status_transition("ACCEPTED", "STARTED", "PROVIDER")
    validate_status_transition("STARTED", "COMPLETED", "PROVIDER")

    # Invalid transitions must raise HTTPException
    with pytest.raises(HTTPException):
        validate_status_transition("PENDING", "COMPLETED", "PROVIDER")

    with pytest.raises(HTTPException):
        validate_status_transition("CANCELLED", "ACCEPTED", "PROVIDER")

def test_role_authorization_for_transitions():
    # Customer cannot accept bookings
    with pytest.raises(HTTPException):
        validate_status_transition("PENDING", "ACCEPTED", "CUSTOMER")

    # Provider cannot cancel customer booking
    with pytest.raises(HTTPException):
        validate_status_transition("PENDING", "CANCELLED", "PROVIDER")
