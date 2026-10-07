import pytest
from app.utils.auth_utils import hash_password, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    plain = "MySecretPass123!"
    hashed = hash_password(plain)
    
    assert hashed != plain
    assert verify_password(plain, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_generation_and_decoding():
    payload = {"sub": "user_id_12345", "role": "CUSTOMER", "email": "test@quickservice.com"}
    token = create_access_token(payload)
    
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user_id_12345"
    assert decoded["role"] == "CUSTOMER"
    assert decoded["email"] == "test@quickservice.com"
