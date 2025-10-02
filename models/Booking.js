const { bookshelf } = require('../config/database');

const Booking = bookshelf.model('Booking', {
  tableName: 'bookings',
  hasTimestamps: true,

  // Define relationships
  room() {
    return this.belongsTo('Room', 'room_id');
  },

  visitor() {
    return this.belongsTo('Visitor', 'visitor_id');
  },

  approvedBy() {
    return this.belongsTo('Admin', 'approved_by');
  },

  // Instance methods
  calculateDuration() {
    const start = new Date(this.get('start_time'));
    const end = new Date(this.get('end_time'));
    return (end - start) / (1000 * 60 * 60); // Duration in hours
  },

  async calculateTotalCost() {
    const room = await this.room().fetch();
    const duration = this.calculateDuration();
    return duration * parseFloat(room.get('hourly_rate'));
  },

  // Virtuals
  virtuals: {
    isActive: function() {
      const now = new Date();
      const startTime = new Date(this.get('start_time'));
      const endTime = new Date(this.get('end_time'));
      return now >= startTime && now <= endTime && this.get('status') === 'confirmed';
    },

    isPast: function() {
      const now = new Date();
      const endTime = new Date(this.get('end_time'));
      return now > endTime;
    }
  }
}, {
  // Class methods
  generateBookingReference() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `BK${timestamp}${random}`.toUpperCase();
  },

  async findByReference(reference) {
    return await this.where({ booking_reference: reference }).fetch({
      withRelated: ['room', 'visitor', 'approvedBy']
    });
  },

  async findConflicting(roomId, date, startTime, endTime, excludeBookingId = null) {
    let query = this.where('room_id', roomId)
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
      });

    if (excludeBookingId) {
      query = query.where('id', '!=', excludeBookingId);
    }

    return await query.fetchAll();
  }
});

module.exports = Booking;