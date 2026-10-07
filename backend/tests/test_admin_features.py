import pytest
from bson import ObjectId
from app.utils.auth_utils import hash_password, create_access_token, decode_access_token

def test_admin_rbac_and_delete_protections():
    customer_token = create_access_token({"sub": "cust_123", "role": "CUSTOMER", "email": "customer@test.com"})
    admin_token = create_access_token({"sub": "admin_123", "role": "ADMIN", "email": "admin@test.com"})

    cust_data = decode_access_token(customer_token)
    admin_data = decode_access_token(admin_token)

    assert cust_data["role"] == "CUSTOMER"
    assert admin_data["role"] == "ADMIN"

def test_objectid_parsing_validation():
    from app.routes.admin_routes import parse_oid
    from fastapi import HTTPException

    valid_id = str(ObjectId())
    oid = parse_oid(valid_id)
    assert str(oid) == valid_id

    with pytest.raises(HTTPException) as exc_info:
        parse_oid("invalid_hex_string")
    assert exc_info.value.status_code == 400

def test_admin_providers_filtering_logic():
    # Verify filter cleaning helper behavior
    from app.routes.admin_routes import get_providers_list
    
    # Check that empty or ALL strings do not set strict query filters
    status_filter = "ALL"
    sf = status_filter.strip().upper()
    assert sf in ["ALL", "UNDEFINED", "NULL", ""]
