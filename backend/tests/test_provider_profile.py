import pytest
from app.schemas.provider_schema import ProviderUpdateRequest, ProviderVerifyRequest

def test_provider_update_schema_validation():
    payload = {
        "businessName": "Apex Care Solutions",
        "serviceCategories": ["Electrician", "AC Repair"],
        "hourlyRate": 150.0,
        "serviceRadius": 25.0,
        "experience": 5,
        "city": "Mumbai"
    }
    
    req = ProviderUpdateRequest(**payload)
    assert req.businessName == "Apex Care Solutions"
    assert len(req.serviceCategories) == 2
    assert req.hourlyRate == 150.0
    assert req.serviceRadius == 25.0
    assert req.experience == 5
    assert req.city == "Mumbai"

def test_provider_verify_schema_validation():
    payload = {
        "status": "VERIFIED",
        "adminNotes": "Document check completed"
    }
    
    req = ProviderVerifyRequest(**payload)
    assert req.status == "VERIFIED"
    assert req.adminNotes == "Document check completed"
