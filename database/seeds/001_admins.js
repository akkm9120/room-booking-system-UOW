const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('admins').del();
  
  // Hash password for default admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Inserts seed entries
  return knex('admins').insert([
    {
      id: 1,
      username: 'admin',
      email: 'admin@uow.edu.au',
      password: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      phone: '+61-2-4221-3555',
      role: 'super_admin',
      is_active: true
    },
    {
      id: 2,
      username: 'roomadmin',
      email: 'roomadmin@uow.edu.au',
      password: hashedPassword,
      first_name: 'Room',
      last_name: 'Administrator',
      phone: '+61-2-4221-3556',
      role: 'admin',
      is_active: true
    }
  ]);
};