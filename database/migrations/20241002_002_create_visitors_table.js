exports.up = function(knex) {
  return knex.schema.createTable('visitors', function(table) {
    table.increments('id').primary();
    table.string('student_id', 20).unique();
    table.string('email', 100).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('first_name', 50).notNullable();
    table.string('last_name', 50).notNullable();
    table.string('phone', 20);
    table.enum('user_type', ['student', 'staff', 'visitor']).defaultTo('student');
    table.string('department', 100);
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('visitors');
};