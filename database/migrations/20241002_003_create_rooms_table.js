exports.up = function(knex) {
  return knex.schema.createTable('rooms', function(table) {
    table.increments('id').primary();
    table.string('room_number', 20).notNullable().unique();
    table.string('room_name', 100).notNullable();
    table.text('description');
    table.integer('capacity').notNullable();
    table.string('location', 100);
    table.string('building', 50);
    table.string('floor', 10);
    table.enum('room_type', ['classroom', 'meeting_room', 'lab', 'auditorium', 'conference_room']).defaultTo('classroom');
    table.json('amenities'); // JSON array of amenities like ['projector', 'whiteboard', 'computer']
    table.decimal('hourly_rate', 8, 2).defaultTo(0.00);
    table.boolean('is_available').defaultTo(true);
    table.boolean('requires_approval').defaultTo(false);
    table.string('image_url');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('rooms');
};