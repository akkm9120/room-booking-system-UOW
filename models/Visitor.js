const { bookshelf } = require('../config/database');
const bcrypt = require('bcryptjs');

const Visitor = bookshelf.model('Visitor', {
  tableName: 'visitors',
  hasTimestamps: true,

  // Define relationships
  bookings() {
    return this.hasMany('Booking', 'visitor_id');
  },

  // Instance methods
  async validatePassword(password) {
    return await bcrypt.compare(password, this.get('password'));
  },

  // Hide password in JSON output
  toJSON() {
    const attrs = bookshelf.Model.prototype.toJSON.call(this);
    delete attrs.password;
    return attrs;
  },

  // Virtuals
  virtuals: {
    fullName: function() {
      return `${this.get('first_name')} ${this.get('last_name')}`;
    }
  }
}, {
  // Class methods
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  },

  async findByEmail(email) {
    return await this.where({ email }).fetch();
  },

  async findByStudentId(studentId) {
    return await this.where({ student_id: studentId }).fetch();
  }
});

module.exports = Visitor;