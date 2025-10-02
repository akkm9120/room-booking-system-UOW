const { bookshelf } = require('../config/database');

const Room = bookshelf.model('Room', {
  tableName: 'rooms',
  hasTimestamps: true,

  // Define relationships
  bookings() {
    return this.hasMany('Booking', 'room_id');
  },

  availability() {
    return this.hasMany('RoomAvailability', 'room_id');
  },

  // Instance methods
  toJSON() {
    const attrs = bookshelf.Model.prototype.toJSON.call(this);
    // Parse amenities JSON string back to array
    if (attrs.amenities) {
      try {
        attrs.amenities = JSON.parse(attrs.amenities);
      } catch (e) {
        attrs.amenities = [];
      }
    }
    return attrs;
  },

  // Virtuals
  virtuals: {
    fullLocation: function() {
      return `${this.get('building')}, ${this.get('location')}`;
    }
  }
}, {
  // Class methods
  async findAvailable(date, startTime, endTime) {
    // Find rooms that don't have conflicting bookings
    const bookedRoomIds = await bookshelf.knex('bookings')
      .select('room_id')
      .where('booking_date', date)
      .where('status', '!=', 'cancelled')
      .where(function() {
        this.where(function() {
          this.where('start_time', '<=', startTime)
            .where('end_time', '>', startTime);
        }).orWhere(function() {
          this.where('start_time', '<', endTime)
            .where('end_time', '>=', endTime);
        }).orWhere(function() {
          this.where('start_time', '>=', startTime)
            .where('end_time', '<=', endTime);
        });
      })
      .pluck('room_id');

    return await this.where('is_available', true)
      .whereNotIn('id', bookedRoomIds)
      .fetchAll();
  },

  async findByRoomNumber(roomNumber) {
    return await this.where({ room_number: roomNumber }).fetch();
  }
});

module.exports = Room;