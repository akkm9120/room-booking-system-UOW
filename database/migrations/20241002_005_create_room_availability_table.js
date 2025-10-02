exports.up = function(knex) {
  return knex.schema.createTable('room_availability', function(table) {
    table.increments('id').primary();
    table.integer('room_id').unsigned().notNullable();
    table.enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.boolean('is_available').defaultTo(true);
    table.timestamps(true, true);
    
    // Foreign key constraint
    table.foreign('room_id').references('id').inTable('rooms').onDelete('CASCADE');
    
    // Unique constraint to prevent duplicate time slots for same room and day
    table.unique(['room_id', 'day_of_week', 'start_time', 'end_time']);
    
    // Index for better performance
    table.index(['room_id', 'day_of_week']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('room_availability');
};