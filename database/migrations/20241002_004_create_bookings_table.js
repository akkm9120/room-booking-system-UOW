exports.up = function(knex) {
  return knex.schema.createTable('bookings', function(table) {
    table.increments('id').primary();
    table.integer('room_id').unsigned().notNullable();
    table.integer('visitor_id').unsigned().notNullable();
    table.string('booking_reference', 20).unique().notNullable();
    table.datetime('start_time').notNullable();
    table.datetime('end_time').notNullable();
    table.date('booking_date').notNullable();
    table.string('purpose', 255).notNullable();
    table.text('description');
    table.integer('expected_attendees').defaultTo(1);
    table.enum('status', ['pending', 'confirmed', 'cancelled', 'completed']).defaultTo('pending');
    table.decimal('total_cost', 8, 2).defaultTo(0.00);
    table.text('admin_notes');
    table.text('cancellation_reason');
    table.integer('approved_by').unsigned();
    table.datetime('approved_at');
    table.timestamps(true, true);
    
    // Foreign key constraints
    table.foreign('room_id').references('id').inTable('rooms').onDelete('CASCADE');
    table.foreign('visitor_id').references('id').inTable('visitors').onDelete('CASCADE');
    table.foreign('approved_by').references('id').inTable('admins').onDelete('SET NULL');
    
    // Indexes for better performance
    table.index(['room_id', 'booking_date']);
    table.index(['visitor_id']);
    table.index(['status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('bookings');
};