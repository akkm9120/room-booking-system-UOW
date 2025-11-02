exports.up = function(knex) {
  return knex.schema.table('bookings', function(table) {
    table.enum('payment_status', ['pending', 'paid', 'failed', 'refunded']).defaultTo('pending');
    table.string('stripe_session_id').nullable();
    table.datetime('payment_date').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('bookings', function(table) {
    table.dropColumn('payment_status');
    table.dropColumn('stripe_session_id');
    table.dropColumn('payment_date');
  });
};