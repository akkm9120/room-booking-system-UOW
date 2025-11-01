const express = require('express');
const router = express.Router();

// Import route modules
const adminRoutes = require('./admin');
const visitorRoutes = require('./visitor');
const paymentRoutes = require('./payment');



// API information endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Room Booking System API',
    version: '1.0.0',
    endpoints: {
      admin: {
        base: '/api/admin',
        description: 'Admin management endpoints',
        routes: [
          'POST /api/admin/login - Admin login',
          'POST /api/admin/register - Create new admin (Super admin only)',
          'GET /api/admin/profile - Get admin profile',
          'GET /api/admin/rooms - Get all rooms',
          'POST /api/admin/rooms - Create new room',
          'GET /api/admin/rooms/:id - Get single room',
          'PUT /api/admin/rooms/:id - Update room',
          'DELETE /api/admin/rooms/:id - Delete room',
          'GET /api/admin/bookings - Get all bookings',
          'GET /api/admin/bookings/:id - Get single booking',
          'PATCH /api/admin/bookings/:id/approve - Approve booking',
          'PATCH /api/admin/bookings/:id/reject - Reject booking',
          'GET /api/admin/visitors - Get all visitors',
          'GET /api/admin/visitors/:id - Get single visitor',
          'PATCH /api/admin/visitors/:id/activate - Activate visitor',
          'PATCH /api/admin/visitors/:id/deactivate - Deactivate visitor',
          'GET /api/admin/dashboard/stats - Get dashboard statistics'
        ]
      },
      visitor: {
        base: '/api/visitor',
        description: 'Visitor/Student endpoints',
        routes: [
          'POST /api/visitor/register - Visitor registration',
          'POST /api/visitor/login - Visitor login',
          'GET /api/visitor/profile - Get visitor profile',
          'PUT /api/visitor/profile - Update visitor profile',
          'GET /api/visitor/rooms - Get available rooms',
          'GET /api/visitor/rooms/:id - Get single room',
          'GET /api/visitor/rooms/:id/availability - Check room availability',
          'POST /api/visitor/bookings - Create new booking',
          'GET /api/visitor/bookings - Get visitor bookings',
          'GET /api/visitor/bookings/:id - Get single booking',
          'PUT /api/visitor/bookings/:id - Update booking',
          'PATCH /api/visitor/bookings/:id/cancel - Cancel booking',
          'GET /api/visitor/bookings/history - Get booking history'
        ]
      }
    },
    documentation: {
      authentication: 'JWT Bearer token required for protected routes',
      content_type: 'application/json',
      response_format: {
        success: 'boolean',
        message: 'string',
        data: 'object|array (optional)',
        pagination: 'object (for paginated responses)'
      }
    }
  });
});

// Stripe redirect routes
router.get('/booking/success', (req, res) => {
  const sessionId = req.query.session_id;
  res.json({
    success: true,
    message: 'Payment successful',
    sessionId: sessionId
  });
});

router.get('/booking/cancel', (req, res) => {
  res.json({
    success: false,
    message: 'Payment cancelled',
  });
});

// Mount route modules
router.use('/admin', adminRoutes);
router.use('/visitor', visitorRoutes);
router.use('/payment', paymentRoutes);

module.exports = router;