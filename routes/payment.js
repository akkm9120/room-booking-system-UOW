const express = require('express');
const router = express.Router();
const stripe = require('stripe')(require('../config/stripe').secretKey);
const stripeConfig = require('../config/stripe');
const auth = require('../middleware/auth');
const { models } = require('../models');

/**
 * Create a Stripe checkout session for a booking
 * @route POST /api/payment/create-checkout-session
 * @param {string} booking_id - The ID of the booking to pay for
 * @returns {Object} Stripe checkout session
 */
router.post('/create-checkout-session', auth.authenticateVisitor, async (req, res) => {
  try {
    const bodyId = req.body?.booking_id;
    const queryId = req.query?.booking_id || req.query?.id;
    const bookingId = bodyId || queryId;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }
    
    // Get booking details
    const booking = await models.Booking.query()
      .findById(bookingId)
      .withGraphFetched('[room, visitor]');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Verify the booking belongs to the authenticated visitor
    if (booking.visitor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this booking' });
    }
    
    // Create line items for Stripe checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: stripeConfig.currency,
            product_data: {
              name: `Room Booking: ${booking.room.room_name}`,
              description: `Booking Reference: ${booking.booking_reference}`,
              // Optional image; only include if FRONTEND_URL is defined and looks valid
              images: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL + '/images/room.jpg'] : undefined,
            },
            unit_amount: Math.round(parseFloat(booking.total_cost) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        booking_reference: booking.booking_reference,
      },
      mode: 'payment',
      success_url: stripeConfig.successUrl,
      cancel_url: stripeConfig.cancelUrl,
    });

    // Return the session ID to the client
    res.json({ success: true, data: { sessionId: session.id, url: session.url } });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ success: false, message: 'Payment processing error', error: error.message });
  }
});

/**
 * Handle Stripe webhook events
 * @route POST /api/payment/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      stripeConfig.webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Create booking only after successful payment
      if (session.metadata && session.metadata.booking_reference) {
        const md = session.metadata;
        try {
          const booking = await models.Booking.query().insert({
            room_id: parseInt(md.room_id, 10),
            visitor_id: parseInt(md.visitor_id, 10),
            booking_reference: md.booking_reference,
            booking_date: md.booking_date,
            start_time: md.start_time,
            end_time: md.end_time,
            purpose: md.purpose || null,
            description: md.description || null,
            expected_attendees: parseInt(md.expected_attendees || '1', 10),
            status: 'pending_approval',
            total_cost: parseFloat(md.total_cost),
            stripe_session_id: session.id,
            payment_date: new Date()
          });

          console.log(`Payment completed; booking created ${booking.booking_reference}`);
        } catch (error) {
          console.error('Error creating booking after payment:', error);
        }
      }
      break;
      
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      console.log(`Payment failed: ${paymentIntent.last_payment_error?.message}`);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

/**
 * Verify payment status for a booking
 * @route GET /api/payment/verify/:bookingId
 */
router.get('/verify/:bookingId', auth.authenticateVisitor, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Get booking details
    const booking = await models.Booking.query().findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Verify the booking belongs to the authenticated visitor
    if (booking.visitor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this booking' });
    }
    
    // Return the booking status
    res.json({
      success: true,
      data: {
        booking_id: booking.id,
        booking_reference: booking.booking_reference,
        status: booking.status,
        is_paid: ['pending_approval','approved','completed'].includes(booking.status) && !!booking.stripe_session_id
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Error verifying payment', error: error.message });
  }
});

module.exports = router;