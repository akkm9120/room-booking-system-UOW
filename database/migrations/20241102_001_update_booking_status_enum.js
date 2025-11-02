exports.up = function(knex) {
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
    ) DEFAULT 'pending_payment'
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE bookings 
    MODIFY COLUMN status ENUM(
      'pending', 
      'confirmed', 
      'cancelled', 
      'completed'
    ) DEFAULT 'pending'
  `);
};