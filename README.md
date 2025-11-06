# Room Booking System - University of Wollongong

A comprehensive room booking system with an admin approval workflow.

## 🚀 Features

- **Admin Approval Workflow**: Multi-stage booking approval process
- **JWT Authentication**: Secure authentication for visitors and admins
- **Room Management**: Complete CRUD operations for rooms and availability
- **Booking Management**: Full lifecycle booking management with status tracking
- **Dashboard Analytics**: Real-time statistics and reporting

## 📋 Booking Workflow

```
1. Visitor creates booking → pending_approval
2. Admin approves/rejects → approved/rejected
3. Visitor can update only approved bookings
4. Visitor can cancel pending_approval bookings
```

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd room-booking-system-UOW
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Database Setup**
   ```bash
   npm run migrate
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 🌐 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected routes require JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📚 API Endpoints

### 🔐 Admin Routes (`/api/admin`)

#### Authentication
- `POST /login` - Admin login
- `POST /register` - Create new admin (Super admin only)
- `GET /profile` - Get admin profile

#### Room Management
- `GET /rooms` - Get all rooms
- `POST /rooms` - Create new room
- `GET /rooms/:id` - Get single room
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room

#### Booking Management
- `GET /bookings` - Get all bookings
- `GET /bookings/:id` - Get single booking
- `PATCH /bookings/:id/approve` - Approve paid booking (pending_approval → approved)
- `PATCH /bookings/:id/reject` - Reject paid booking (pending_approval → rejected)

#### Visitor Management
- `GET /visitors` - Get all visitors
- `GET /visitors/:id` - Get single visitor
- `PATCH /visitors/:id/activate` - Activate visitor
- `PATCH /visitors/:id/deactivate` - Deactivate visitor

#### Analytics
- `GET /dashboard/stats` - Get dashboard statistics

### 👤 Visitor Routes (`/api/visitor`)

#### Authentication
- `POST /register` - Visitor registration
- `POST /login` - Visitor login
- `GET /profile` - Get visitor profile
- `PUT /profile` - Update visitor profile

#### Room Discovery
- `GET /rooms` - Get available rooms
- `GET /rooms/:id` - Get single room
- `GET /rooms/:id/availability` - Check room availability

#### Booking Management
- `POST /bookings` - Create new booking (no payment)
- `GET /bookings` - Get visitor bookings
- `GET /bookings/:id` - Get single booking
- `PUT /bookings/:id` - Update booking (approved bookings only)
- `PATCH /bookings/:id/cancel` - Cancel booking (pending_approval only)
- `GET /bookings/history` - Get booking history

## 📊 Booking Status Flow

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| `pending_approval` | Awaiting admin decision | Cancel, Admin Approve/Reject |
| `approved` | Admin approved the booking | Update, View |
| `rejected` | Admin rejected the booking | View only |
| `cancelled` | User cancelled | View only |

## 🔒 Business Rules

### Cancellation Policy
- ✅ **Allowed**: `pending_approval` bookings
- ❌ **Not Allowed**: `approved`, `rejected`, or `cancelled` bookings

### Update Policy  
- ✅ **Allowed**: `approved` bookings only
- ❌ **Not Allowed**: All other statuses

### Admin Actions
- ✅ **Can Approve/Reject**: `pending_approval` bookings only
- ❌ **Cannot Act On**: Other statuses


## 📝 Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "message": "string",
  "data": "object|array (optional)",
  "pagination": "object (for paginated responses)",
}
```

## 🚀 Deployment

The application is configured for Railway deployment with:
- `Procfile` for process management
- `railway.json` for Railway-specific configuration
- Environment variable configuration

### Frontend Deployment (Vercel)

- Prerequisites:
  - Push your frontend repository to GitHub.
  - Ensure the frontend builds locally (`npm run build`).
- Vercel Settings (typical Vite React app):
  - Framework preset: `Vite`
  - Build command: `npm run build`
  - Output directory: `dist`
- Environment variables (Vercel → Settings → Environment Variables):
  - `VITE_API_BASE_URL` = `https://<your-backend-domain>/api` or `http://localhost:3000/api`
- CORS on backend:
  - Update `.env` `ALLOWED_ORIGINS` with your Vercel domain(s), e.g. `https://<your-vercel-app>.vercel.app`.
- Deploy flow:
  1. Import your frontend GitHub repo in Vercel.
  2. Add `VITE_API_BASE_URL` in Project → Settings → Environment Variables.
  3. Trigger a deployment. Validate API calls succeed.
  4. If CORS errors occur, add the Vercel domain to `ALLOWED_ORIGINS` on backend and restart.

### GitHub Push Commands

- Backend (from this folder):
```
git init
git add -A
git commit -m "chore: configure env-driven CORS and add frontend integration docs"
git branch -M main
git remote add origin https://github.com/<your-user>/<backend-repo>.git
git push -u origin main
```

- Frontend (from your frontend folder):
```
git init
git add -A
git commit -m "feat: initial frontend"
git branch -M main
git remote add origin https://github.com/<your-user>/<frontend-repo>.git
git push -u origin main
```

## 🛠 Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Knex.js and Bookshelf
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Railway

## 🔗 Frontend Integration

- **CORS**: Configure allowed frontend origins via `ALLOWED_ORIGINS` in `.env`.
  - Example: `ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.com`
- **Base URL**: `http://localhost:${PORT}/api` (default `http://localhost:3000/api`).
- **Auth Header**: `Authorization: Bearer <token>` for protected routes.

### Quick Examples (Axios)

- Admin login and store token:
```js
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

async function adminLogin(email, password) {
  const { data } = await api.post('/admin/login', { email, password });
  // data = { success: true, message, data: { admin }, token }
  localStorage.setItem('admin_token', data.token);
  api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
  return data.data.admin;
}
```

- Visitor login and fetch profile:
```js
async function visitorLogin(email, password) {
  const { data } = await api.post('/visitor/login', { email, password });
  localStorage.setItem('visitor_token', data.token);
  api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
  const profile = await api.get('/visitor/profile');
  return profile.data.data;
}
```

- Discover rooms with filters:
```js
async function getAvailableRooms({ page = 1, limit = 10, search, room_type, capacity_min, capacity_max, date, start_time, end_time } = {}) {
  const { data } = await api.get('/visitor/rooms', {
    params: { page, limit, search, room_type, capacity_min, capacity_max, date, start_time, end_time }
  });
  return { rooms: data.data, pagination: data.pagination };
}
```

- Check room availability:
```js
async function checkAvailability(roomId, { date, start_time, end_time }) {
  const { data } = await api.get(`/visitor/rooms/${roomId}/availability`, { params: { date, start_time, end_time } });
  return data.data; // { is_available, conflicting_bookings: [...] }
}
```

- Create booking (visitor):
```js
async function createBooking({ room_id, booking_date, start_time, end_time, purpose, description, expected_attendees }) {
  const { data } = await api.post('/visitor/bookings', { room_id, booking_date, start_time, end_time, purpose, description, expected_attendees });
  return data.data; // booking payload
}
```

### Response Shape

- All responses follow:
```json
{
  "success": true,
  "message": "string",
  "data": {},
  "pagination": { "page": 1, "pageSize": 10, "rowCount": 42, "pageCount": 5 }
}
```

### Environment Setup for Frontend

- In `.env`, set `ALLOWED_ORIGINS` to include your frontend dev URL (e.g., `http://localhost:5173`) and production domain(s).
- Restart the server after changing `.env`.

## 📞 Support

For technical support or questions about the API, please refer to the endpoint documentation available at:
```
GET /api/
```

This endpoint provides real-time API documentation and status information.