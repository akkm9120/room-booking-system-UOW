// Migration: Update bookings.status enum to remove 'pending_payment' and legacy values
// Sets default to 'pending_approval'

exports.up = async function(knex) {
  // Normalize existing data to fit the new enum
  // 1) Map legacy 'confirmed' → 'approved'
  await knex('bookings').where({ status: 'confirmed' }).update({ status: 'approved' });
  // 2) Map 'pending' → 'pending_approval' if it has a Stripe session (likely paid), otherwise cancel
  await knex('bookings').where({ status: 'pending' }).whereNotNull('stripe_session_id').update({ status: 'pending_approval' });
  await knex('bookings').where({ status: 'pending' }).whereNull('stripe_session_id').update({ status: 'cancelled' });
  // 3) Map 'pending_payment' → 'cancelled' (unpaid pre-bookings should not block slots)
  await knex('bookings').where({ status: 'pending_payment' }).update({ status: 'cancelled' });

  // Finally alter enum to the new set without 'pending_payment' and legacy values
  await knex.raw(`
    ALTER TABLE bookings
    MODIFY COLUMN status ENUM(
      'pending_approval',
      'approved',
      'rejected',
      'cancelled',
      'completed'
    ) NOT NULL DEFAULT 'pending_approval'
  `);
};

exports.down = function(knex) {
  // Reintroduce legacy statuses including 'pending_payment' and set default back
  return knex.raw(`
    ALTER TABLE bookings
    MODIFY COLUMN status ENUM(
      'pending_payment',
      'pending_approval',
      'approved',
      'rejected',
      'cancelled',
      'completed',
      'pending',
      'confirmed'
    ) NOT NULL DEFAULT 'pending_payment'
  `);
};