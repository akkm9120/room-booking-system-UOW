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
    version: '2.0.0',
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
          'PATCH /api/admin/bookings/:id/approve - Approve paid booking (pending_approval → approved)',
          'PATCH /api/admin/bookings/:id/reject - Reject paid booking (pending_approval → rejected)',
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
          'POST /api/visitor/bookings - Create new booking with Stripe payment (returns checkout URL)',
          'GET /api/visitor/bookings - Get visitor bookings',
          'GET /api/visitor/bookings/:id - Get single booking',
          'PUT /api/visitor/bookings/:id - Update booking (approved bookings only)',
          'PATCH /api/visitor/bookings/:id/cancel - Cancel booking (paid/pending_approval only)',
          'GET /api/visitor/bookings/history - Get booking history',
          'POST /api/visitor/stripe/webhook - Stripe webhook for payment confirmations'
        ]
      },
      payment: {
        base: '/api/payment',
        description: 'Payment processing endpoints',
        routes: [
          'POST /api/payment/create-checkout-session - Create Stripe checkout session',
          'POST /api/payment/webhook - Stripe webhook handler'
        ]
      }
    },
    booking_workflow: {
      description: 'Booking is persisted only after successful payment, then admin approval',
      status_flow: 'pending_approval → approved/rejected',
      statuses: {
        pending_approval: 'Payment completed, awaiting admin decision',
        approved: 'Admin approved the booking',
        rejected: 'Admin rejected the booking',
        cancelled: 'User cancelled or payment expired'
      },
      restrictions: {
        cancellation: 'Only allowed for paid/pending_approval bookings',
        updates: 'Only allowed for approved bookings',
        admin_actions: 'Can only approve/reject pending_approval bookings'
      }
    },
    stripe_integration: {
      description: 'Stripe payment processing with webhooks',
      checkout_flow: 'POST /bookings returns Stripe checkout URL → User pays → Webhook confirms payment',
      webhook_events: [
        'checkout.session.completed - Updates status to pending_approval',
        'checkout.session.expired - Cancels unpaid booking'
      ]
    },
    documentation: {
      authentication: 'JWT Bearer token required for protected routes',
      content_type: 'application/json',
      response_format: {
        success: 'boolean',
        message: 'string',
        data: 'object|array (optional)',
        pagination: 'object (for paginated responses)',
        checkout_url: 'string (for booking creation with Stripe)'
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