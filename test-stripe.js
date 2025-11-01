/**
 * Stripe Payment Integration Test Script
 * 
 * This script tests the Stripe payment integration by:
 * 1. Creating a test booking
 * 2. Generating a Stripe checkout session
 * 3. Printing the checkout URL (which you can open in a browser)
 * 
 * Usage: node test-stripe.js
 */

require('dotenv').config();
const stripe = require('stripe')(require('./config/stripe').secretKey);
const stripeConfig = require('./config/stripe');
const models = require('./models');

async function testStripeIntegration() {
  try {
    console.log('Starting Stripe integration test...');
    
    // 1. Find a visitor and room to use for testing
    const visitor = await models.Visitor.forge().fetch();
    const room = await models.Room.forge().fetch();
    
    if (!visitor || !room) {
      console.error('Error: Could not find visitor or room for testing');
      return;
    }
    
    console.log(`Using visitor: ${visitor.email} and room: ${room.room_name}`);
    
    // 2. Generate a booking reference
    const bookingReference = 'TEST-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // 3. Calculate total cost
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);
    
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 1);
    
    const durationHours = 2; // 2 hours
    const totalCost = durationHours * parseFloat(room.get('hourly_rate'));
    
    console.log(`Creating test booking: ${bookingReference} for ${durationHours} hours, cost: $${totalCost}`);
    
    // Format dates for MySQL
    const formatMySQLDateTime = (date) => {
      return date.toISOString().replace('T', ' ').substring(0, 19);
    };
    
    // 4. Create a test booking
    const booking = await models.Booking.forge({
      room_id: room.get('id'),
      visitor_id: visitor.get('id'),
      booking_reference: bookingReference,
      booking_date: bookingDate.toISOString().split('T')[0],
      start_time: formatMySQLDateTime(startTime),
      end_time: formatMySQLDateTime(endTime),
      purpose: 'Stripe Test',
      description: 'Testing Stripe integration',
      expected_attendees: 2,
      status: 'pending',
      total_cost: totalCost
    }).save();
    
    console.log(`Booking created with ID: ${booking.get('id')}`);
    
    // 5. Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: stripeConfig.currency,
            product_data: {
              name: `Room Booking: ${room.get('room_name')}`,
              description: `Booking Reference: ${bookingReference}`,
            },
            unit_amount: Math.round(totalCost * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.get('id'),
        booking_reference: bookingReference,
      },
      mode: 'payment',
      success_url: stripeConfig.successUrl,
      cancel_url: stripeConfig.cancelUrl,
    });
    
    console.log('\n=== TEST RESULTS ===');
    console.log(`Stripe Session ID: ${session.id}`);
    console.log(`\nCheckout URL (open this in your browser to test payment):\n${session.url}`);
    console.log('\nTest card details:');
    console.log('Card number: 4242 4242 4242 4242');
    console.log('Expiry: Any future date (e.g., 12/34)');
    console.log('CVC: Any 3 digits (e.g., 123)');
    console.log('Name: Any name');
    console.log('\nAfter payment, check your database to verify the booking status was updated to "confirmed"');
    
  } catch (error) {
    console.error('Error testing Stripe integration:', error);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Run the test
testStripeIntegration();