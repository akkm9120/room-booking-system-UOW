exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('rooms').del();
  
  // Inserts seed entries
  return knex('rooms').insert([
    {
      id: 1,
      room_number: 'LT101',
      room_name: 'Lecture Theatre 101',
      description: 'Large lecture theatre with modern AV equipment',
      capacity: 150,
      location: 'Building 1, Ground Floor',
      building: 'Building 1',
      floor: 'Ground',
      room_type: 'auditorium',
      amenities: JSON.stringify(['projector', 'microphone', 'whiteboard', 'air_conditioning']),
      hourly_rate: 50.00,
      is_available: true,
      requires_approval: true
    },
    {
      id: 2,
      room_number: 'CR201',
      room_name: 'Conference Room 201',
      description: 'Medium-sized conference room for meetings',
      capacity: 20,
      location: 'Building 2, Second Floor',
      building: 'Building 2',
      floor: '2',
      room_type: 'conference_room',
      amenities: JSON.stringify(['projector', 'whiteboard', 'video_conference', 'air_conditioning']),
      hourly_rate: 25.00,
      is_available: true,
      requires_approval: false
    },
    {
      id: 3,
      room_number: 'LAB301',
      room_name: 'Computer Lab 301',
      description: 'Computer laboratory with 30 workstations',
      capacity: 30,
      location: 'Building 3, Third Floor',
      building: 'Building 3',
      floor: '3',
      room_type: 'lab',
      amenities: JSON.stringify(['computers', 'projector', 'whiteboard', 'air_conditioning']),
      hourly_rate: 40.00,
      is_available: true,
      requires_approval: true
    },
    {
      id: 4,
      room_number: 'MR102',
      room_name: 'Meeting Room 102',
      description: 'Small meeting room for group discussions',
      capacity: 8,
      location: 'Building 1, Ground Floor',
      building: 'Building 1',
      floor: 'Ground',
      room_type: 'meeting_room',
      amenities: JSON.stringify(['whiteboard', 'tv_screen', 'air_conditioning']),
      hourly_rate: 15.00,
      is_available: true,
      requires_approval: false
    }
  ]);
};