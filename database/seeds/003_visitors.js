const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('visitors').del();

  // Add two visitors
  await knex('visitors').insert([
    {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      student_id: 'johndoe123',
      password: await bcrypt.hash('password123', 10),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      student_id: 'janesmith456',
      password: await bcrypt.hash('password456', 10),
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};