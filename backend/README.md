# QuickService Backend API

Python FastAPI backend for QuickService platform with MongoDB Atlas persistence, JWT authorization, Pydantic validation, and Motor async driver.

For complete project documentation, system architecture, database schemas, and setup instructions, please see the main [Root README](../README.md).

## Quick Commands:
```powershell
# Run Connection Test
python check_connection.py

# Seed Admin & Services
python seed.py

# Run Test Suite
python -m pytest -v

# Start FastAPI Dev Server
python -m uvicorn app.main:app --reload --port 8000
```
