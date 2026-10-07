# QuickService

> **"Find. Book. Get It Fixed."**

A complete, high-performance, full-stack home service booking and management platform built with React.js (Vite + Tailwind CSS), Python FastAPI, and MongoDB Atlas.

---

## 1. Executive Summary

**QuickService** connects homeowners and customers with verified local service providers (electricians, plumbers, AC technicians, appliance repair experts, painters, and cleaners). It provides real-time time slot booking, double-booking race condition prevention at the database layer, role-based authorization, customer feedback reviews, dispute complaint resolution, and an executive system admin dashboard.

---

## 2. What is QuickService?

### The Problem It Solves
Finding reliable, verified home repair and maintenance professionals is often frustrating due to unverified workers, hidden pricing, double-booked appointments, and a lack of accountability when issues arise.

### Who Uses QuickService?
1. **Customers**: Search local verified professionals, view transparent pricing, select guaranteed 1-hour time slots, track booking status, and rate completed work.
2. **Providers**: List business services, set hourly rates and service radius, manage daily availability schedules, accept/reject booking requests, and track earnings.
3. **System Admin**: Monitor platform revenue and metrics, audit user accounts, verify provider applications, manage service categories, resolve customer complaints, and inspect audit activity logs.

---

## 3. Features by User Role

### 👤 Customer Features
* **Authentication**: Register with instant validation and secure JWT session handling.
* **Provider Discovery**: Search and filter providers by service category, city, minimum rating, experience, and hourly pricing.
* **Interactive Booking Wizard**: 8-step booking process with live date picking, 1-hour slot availability check, address selection, and atomic booking sequence generation (`QS-2026-000001`).
* **Booking Lifecycle Tracking**: Real-time status progression timeline (`PENDING` ➔ `ACCEPTED` ➔ `STARTED` ➔ `COMPLETED`).
* **Reviews & Ratings**: Submit ratings (1–5 stars) and detailed reviews for completed bookings, automatically recalculating provider rating averages.
* **Dispute Complaint Filing**: Submit complaints for troubled bookings with direct admin oversight and status tracking.
* **Notifications**: Live notifications for booking acceptance, job start, completion, and complaint resolutions.

### 🛠️ Service Provider Features
* **Registration & Onboarding**: Public registration requiring admin verification (`PENDING` status).
* **Schedule & Availability Control**: Toggle availability on/off, select working days, and set daily operating hours.
* **Booking Management**: Review incoming customer requests, accept or reject jobs, mark jobs as started upon arrival, and mark jobs as completed.
* **Business Profile Editing**: Update business description, service radius, experience, hourly rate, and multi-select service categories.

### 🛡️ System Admin Features
* **Executive Metrics Dashboard**: Real-time count cards for total/active/inactive customers, provider status breakdown (`PENDING`, `VERIFIED`, `SUSPENDED`, `REJECTED`), services, bookings, completed jobs, and open complaints.
* **Customer Account Management (`/admin/users`)**: Search, filter by status/city, paginate, view full profiles with transaction counts, edit profile fields, toggle active status, reset user passwords (bcrypt), and execute safe deletions with historical anonymization.
* **Provider Verification & Management (`/admin/providers`)**: Review application details, multi-select service category edits, approve (`VERIFIED`), suspend, or reject providers, send automated notifications, and execute safe deletions.
* **Audit Activity Logging (`adminLogs`)**: Automated, immutable activity log recording all administrative actions (`who`, `action`, `targetType`, `targetId`, `timestamp`, `summary`).
* **Service Category CRUD**: Add, edit, upload icons, activate/deactivate service categories.
* **Complaint Resolution Center**: Review customer complaints, post official admin responses, and update complaint status (`OPEN` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED`).
* **Recharts Analytics**: Interactive charts showing monthly booking volume trends and popular service distribution.

---

## 4. Technology Stack & Rationale

| Layer | Technology | Rationale / Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React.js 18 (Vite) | Lightning-fast HMR build tool, declarative component architecture. |
| **Styling & UI** | Tailwind CSS | Modern utility-first design system with sleek dark/light micro-interactions. |
| **Icons & Visuals** | Lucide React | Clean, modern SVG icon iconography. |
| **Analytics Visualization** | Recharts | Responsive, interactive HTML5 SVG charts. |
| **Backend Framework** | Python FastAPI | Asynchronous ASGI framework with auto OpenAPI documentation (`/docs`). |
| **Database & Driver** | MongoDB Atlas / Motor | Asynchronous non-blocking MongoDB driver for Python (`motor.motor_asyncio`). |
| **Authentication & Security** | PyJWT & Passlib (Bcrypt) | Stateless JWT Bearer authentication and cryptographically secure salted password hashing. |
| **Configuration** | Pydantic v2 `SettingsConfigDict` | Type-safe environment variable parsing and validation from `.env`. |

---

## 5. System Architecture & Data Flow

```text
+-------------------------------------------------------------------+
|                        BROWSER / CLIENT                            |
|             React.js + Vite + Tailwind CSS + Axios                |
+-------------------------------------------------------------------+
                                  |
                                  | HTTP REST API Requests
                                  | (Bearer JWT Token in Authorization Header)
                                  v
+-------------------------------------------------------------------+
|                        FASTAPI BACKEND                            |
|           main.py | CORS Middleware | Auth Dependencies           |
+-------------------------------------------------------------------+
                                  |
        +-------------------------+-------------------------+
        |                         |                         |
        v                         v                         v
+---------------+       +-------------------+     +------------------+
| Auth Router   |       | Booking Engine    |     | Admin Router     |
| (bcrypt & JWT)|       | (Slot Lock & 409) |     | (Audit & CRUD)   |
+---------------+       +-------------------+     +------------------+
        |                         |                         |
        +-------------------------+-------------------------+
                                  |
                                  | Asynchronous Motor Async Queries
                                  v
+-------------------------------------------------------------------+
|                       MONGODB ATLAS DATABASE                      |
| collections: users | providers | services | bookings | adminLogs |
+-------------------------------------------------------------------+
```

---

## 6. Project Folder Structure

```text
quickservice/
├── backend/
│   ├── app/
│   │   ├── dependencies/       # Security & RBAC authentication dependencies
│   │   ├── routes/             # REST API endpoint route handlers
│   │   │   ├── admin_routes.py # Admin metrics, user/provider CRUD, activity logs
│   │   │   ├── auth_routes.py  # User registration, login, /me, profile updates
│   │   │   ├── booking_routes.py # Booking sequence generator, slots, double-booking lock
│   │   │   ├── complaint_routes.py # Dispute tickets and resolution
│   │   │   ├── notification_routes.py # User notifications
│   │   │   ├── provider_routes.py # Provider discovery, search & filtering
│   │   │   ├── review_routes.py # Customer reviews & rating recalculations
│   │   │   └── service_routes.py # Public & admin service category endpoints
│   │   ├── config.py           # Pydantic Settings environment configuration
│   │   ├── database.py         # Motor MongoDB connection, startup indexes & seeds
│   │   ├── main.py             # FastAPI app initialization, CORS & router mounts
│   │   └── utils/              # JWT encoding/decoding and bcrypt password hashing
│   ├── tests/                  # Pytest test suite (auth, double booking, admin rules)
│   ├── .env                    # Local environment variables (git-ignored)
│   ├── .env.example            # Sample environment configuration template
│   ├── check_connection.py     # Database connection ping verification script
│   ├── check_db.py             # Database inspection tool
│   ├── pytest.ini              # Pytest configuration settings
│   ├── requirements.txt        # Python backend dependencies
│   └── seed.py                 # Development seed script for Atlas
└── frontend/
    ├── src/
    │   ├── components/         # Reusable UI components (Navbar, Footer, Modals)
    │   │   └── admin/          # Admin UI components (DataTable, ConfirmModal, StatusBadge)
    │   ├── context/            # AuthContext provider & JWT state manager
    │   ├── pages/              # Public, Customer, Provider, and Admin pages
    │   ├── services/           # Centralized Axios API instances & admin endpoints
    │   ├── App.jsx             # Main Application Routing & ProtectedRoute guards
    │   └── main.jsx            # React root entry point
    ├── .env                    # Frontend environment settings (VITE_API_URL)
    ├── package.json            # Node.js frontend dependencies
    └── vite.config.js          # Vite build configuration & chunk splitting
```

---

## 7. Database Design & Collections Schema

### `users` Collection
* `_id`: ObjectId
* `fullName`: String
* `email`: String (Indexed, Unique)
* `phone`: String
* `password_hash`: String (Bcrypt)
* `role`: String (`CUSTOMER`, `PROVIDER`, `ADMIN`)
* `isActive`: Boolean (Default: `True`)
* `createdAt`: UTC Timestamp

### `providers` Collection
* `_id`: ObjectId
* `userId`: String (Foreign key referencing `users._id`)
* `businessName`: String
* `description`: String
* `serviceCategories`: Array of Strings (Indexed)
* `city`: String (Indexed)
* `verificationStatus`: String (`PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED`)
* `rating`: Float (Default: `0.0`)
* `totalReviews`: Integer (Default: `0`)
* `completedJobs`: Integer (Default: `0`)

### `bookings` Collection
* `_id`: ObjectId
* `bookingId`: String (Unique Sequence e.g. `QS-2026-000001`)
* `customerId`: String (Indexed)
* `providerId`: String (Indexed)
* `bookingDate`: String (`YYYY-MM-DD`, Indexed)
* `timeSlot`: String (`09:00 AM - 10:00 AM`, Indexed)
* `status`: String (`PENDING`, `ACCEPTED`, `STARTED`, `COMPLETED`, `CANCELLED`, `REJECTED`)
* **Compound Partial Index**: `{ providerId: 1, bookingDate: 1, timeSlot: 1 }` with `partialFilterExpression: { status: { $in: ["PENDING", "ACCEPTED", "STARTED"] } }` (Blocks race condition double bookings).

### `adminLogs` Collection
* `_id`: ObjectId
* `adminId`: String
* `adminEmail`: String
* `action`: String (e.g. `EDIT_CUSTOMER`, `PROVIDER_VERIFIED`, `DELETE_PROVIDER`)
* `targetType`: String (`USER`, `PROVIDER`, `SERVICE`)
* `targetId`: String
* `shortSummary`: String
* `createdAt`: UTC Timestamp

---

## 8. Authentication & Authorization Flow

1. **User Registration**:
   - `POST /api/auth/register` accepts registration payload.
   - For `PROVIDER` role, a linked document in `providers` is created with `verificationStatus="PENDING"`.
   - Public registration with `ADMIN` role is blocked (`403 Forbidden`).
2. **Password Security**:
   - Passwords are salted and hashed using Bcrypt before storage in MongoDB.
3. **Login & Session Management**:
   - `POST /api/auth/login` validates credentials against stored bcrypt hash.
   - Generates a signed JWT access token valid for `JWT_EXPIRE_MINUTES` (e.g. 1440 mins).
   - Frontend stores token in `localStorage` and automatically attaches `Authorization: Bearer <token>` to all Axios HTTP requests.
4. **Session Hydration**:
   - On page load, `AuthContext` calls `GET /api/auth/me` to verify token validity and restore user state.

---

## 9. Booking Flow & Double-Booking Prevention

```text
[ Customer Selects Service & Date ] 
               │
               ▼
[ GET /api/bookings/available-slots?providerId=...&date=... ]
               │
               ▼
[ Customer Submits Booking Request ]
               │
               ▼
[ POST /api/bookings ] ➔ [ Atomic Sequence Counter: QS-2026-000001 ]
               │
               ▼
[ MongoDB Insert ] ➔ (If Duplicate Provider+Date+Slot exists ➔ HTTP 409 Conflict)
               │
               ▼
[ Booking Created (PENDING) ] ➔ [ Notification Sent to Provider ]
               │
               ▼
[ Provider Accepts Request ] ➔ (Status: ACCEPTED)
               │
               ▼
[ Provider Starts Service ]  ➔ (Status: STARTED)
               │
               ▼
[ Job Completion ]          ➔ (Status: COMPLETED)
               │
               ▼
[ Customer Reviews Service ] ➔ [ Provider Rating Updated ]
```

---

## 10. Reviews, Complaints & Notifications

* **Reviews**: Allowed strictly after a booking reaches `COMPLETED` status. Each review automatically triggers a recalculation of the provider's overall rating average.
* **Complaints**: Customers can log dispute tickets against any booking. Admin can view complaints, update ticket status (`OPEN` ➔ `IN_PROGRESS` ➔ `RESOLVED`), and reply with official resolution notes.
* **Notifications**: Automated messages generated upon booking creation, status updates, and complaint resolutions.

---

## 11. Complete API Reference

| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System health check endpoint |
| `POST` | `/api/auth/register` | Public | Register new Customer or Provider account |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/services` | Public | List active service categories |
| `GET` | `/api/providers` | Public | Search and filter verified providers |
| `POST` | `/api/bookings` | Customer | Create new booking (returns 409 on slot collision) |
| `PUT` | `/api/bookings/{id}/status` | Provider/Customer | Update booking status transition |
| `GET` | `/api/admin/dashboard` | Admin | Executive count stats and activity logs |
| `GET` | `/api/admin/users` | Admin | Paginated list of registered customers |
| `PUT` | `/api/admin/users/{id}` | Admin | Update customer profile details |
| `DELETE` | `/api/admin/users/{id}` | Admin | Safely delete customer (anonymizes past records) |
| `GET` | `/api/admin/providers` | Admin | Paginated list of service providers |
| `PUT` | `/api/providers/{id}/verify` | Admin | Update provider verification status |

---

## 12. Environment Variables Guide

#### `backend/.env`
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/quickservice?retryWrites=true&w=majority
DB_NAME=quickservice
JWT_SECRET=your_super_secret_64_char_random_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173

ADMIN_EMAIL=admin@quickservice.com
ADMIN_PASSWORD=Admin@QuickService2026
ADMIN_NAME=System Admin
ADMIN_PHONE=9876543210
```

#### `frontend/.env`
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 13. Local Setup & Installation

### Prerequisites
* Python 3.10+ installed
* Node.js v18+ installed
* MongoDB Atlas Account (or local MongoDB server)

### Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python check_connection.py   # Verify MongoDB connection
python seed.py               # Seed initial admin & service categories
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

---

## 14. Testing Suite

Run backend pytest suite:
```powershell
cd backend
.\venv\Scripts\python -m pytest -v
```

---

---

## 15. Free Cloud Deployment (Render + Vercel + MongoDB Atlas)

### Architecture
* **Frontend**: Vercel Free Hobby Plan (React Vite SPA)
* **Backend**: Render Free Web Service (Python FastAPI, Python 3.13)
* **Database**: MongoDB Atlas M0 Free Cluster

### Environment Variable Table

| Variable Name | Location | Example Value / Purpose |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Render Env | `production` |
| `MONGODB_URI` | Render Env | `mongodb+srv://<user>:<pass>@cluster.mongodb.net/quickservice_prod` |
| `DB_NAME` | Render Env | `quickservice_prod` |
| `JWT_SECRET` | Render Env | `64-character random key` |
| `FRONTEND_URL` | Render Env | `https://your-app.vercel.app` |
| `ADMIN_EMAIL` | Render Env | `admin@quickservice.com` |
| `ADMIN_PASSWORD` | Render Env | `YourSecurePassword123` |
| `VITE_API_URL` | Vercel Env | `https://your-backend.onrender.com/api` |

---

## 16. License & Author

**QuickService Platform** © 2026. Built with Python FastAPI, React.js, and MongoDB Atlas.

