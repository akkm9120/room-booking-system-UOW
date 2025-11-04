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

## 🛠 Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Knex.js ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Railway

## 📞 Support

For technical support or questions about the API, please refer to the endpoint documentation available at:
```
GET /api/
```

This endpoint provides real-time API documentation and status information.