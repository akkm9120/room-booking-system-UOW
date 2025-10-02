const { bookshelf } = require('../config/database');

const RoomAvailability = bookshelf.model('RoomAvailability', {
  tableName: 'room_availability',
  hasTimestamps: true,

  // Define relationships
  room() {
    return this.belongsTo('Room', 'room_id');
  }
}, {
  // Class methods
  async findByRoomAndDay(roomId, dayOfWeek) {
    return await this.where({ room_id: roomId, day_of_week: dayOfWeek })
      .orderBy('start_time')
      .fetchAll();
  }
});

module.exports = RoomAvailability;