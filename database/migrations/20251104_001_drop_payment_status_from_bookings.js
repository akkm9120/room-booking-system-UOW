/**
 * Migration: Drop payment_status column from bookings
 */

exports.up = async function(knex) {
  // MySQL syntax for dropping a column
  await knex.schema.alterTable('bookings', table => {
    table.dropColumn('payment_status');
  });
};

exports.down = async function(knex) {
  // Recreate column if rolled back
  await knex.schema.alterTable('bookings', table => {
    table.enum('payment_status', ['pending', 'paid', 'failed', 'refunded']).defaultTo('pending');
  });
};