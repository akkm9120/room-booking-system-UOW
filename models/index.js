const knexLib = require('knex');
const bookshelfLib = require('bookshelf');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Load knex configuration and initialize bookshelf
const knexConfig = require(path.resolve(__dirname, '..', 'knexfile.js'));
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const knex = knexLib(knexConfig[env]);
const bookshelf = bookshelfLib(knex);

// Helper: add a naive fetchPage to Model instances (no plugin required)
bookshelf.Model.prototype.fetchPage = async function({ page = 1, pageSize = 10, withRelated = [] } = {}) {
  const all = await this.fetchAll({ withRelated });
  const items = all.toArray();
  const total = items.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const pagedItems = items.slice(start, start + parseInt(pageSize));
  const collection = this.constructor.collection(pagedItems);
  collection.pagination = {
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    rowCount: total,
    pageCount: Math.max(1, Math.ceil(total / parseInt(pageSize)))
  };
  return collection;
};

// Helper: static count() on models
function addCount(Model) {
  Model.count = async function() {
    const table = this.prototype.tableName;
    const res = await knex(table).count({ count: '*' });
    const v = res[0];
    // Support various drivers' count field names
    const key = Object.keys(v)[0];
    return parseInt(v[key]);
  };
}

// Admin model
const Admin = bookshelf.model('Admin', {
  tableName: 'admins',
  hasTimestamps: true,
  // Relations
  approvedBookings() {
    return this.hasMany('Booking', 'approved_by');
  },
  // Instance methods
  async validatePassword(password) {
    const hashed = this.get('password');
    return bcrypt.compare(password, hashed);
  }
}, {
  // Static methods
  async findByEmail(email) {
    return this.where({ email }).fetch({ require: false });
  },
  async findByUsername(username) {
    return this.where({ username }).fetch({ require: false });
  },
  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }
});
addCount(Admin);

// Visitor model
const Visitor = bookshelf.model('Visitor', {
  tableName: 'visitors',
  hasTimestamps: true,
  bookings() {
    return this.hasMany('Booking', 'visitor_id');
  },
  async validatePassword(password) {
    const hashed = this.get('password');
    return bcrypt.compare(password, hashed);
  }
}, {
  async findByEmail(email) {
    return this.where({ email }).fetch({ require: false });
  },
  async findByStudentId(student_id) {
    return this.where({ student_id }).fetch({ require: false });
  },
  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }
});
addCount(Visitor);

// Room model
const Room = bookshelf.model('Room', {
  tableName: 'rooms',
  hasTimestamps: true,
  bookings() {
    return this.hasMany('Booking', 'room_id');
  }
});
addCount(Room);

// Booking model
const Booking = bookshelf.model('Booking', {
  tableName: 'bookings',
  hasTimestamps: true,
  room() {
    return this.belongsTo('Room', 'room_id');
  },
  visitor() {
    return this.belongsTo('Visitor', 'visitor_id');
  },
  approvedBy() {
    return this.belongsTo('Admin', 'approved_by');
  }
}, {
  async checkConflictingBookings(room_id, booking_date, start_time, end_time) {
    return await Booking
      .query(qb => {
        qb.where('room_id', room_id)
          .where('booking_date', booking_date)
          .whereIn('status', ['pending_approval', 'approved', 'completed'])
          .where(function() {
            this.where(function() {
              this.where('start_time', '<=', start_time)
                .where('end_time', '>', start_time);
            }).orWhere(function() {
              this.where('start_time', '<', end_time)
                .where('end_time', '>=', end_time);
            }).orWhere(function() {
              this.where('start_time', '>=', start_time)
                .where('end_time', '<=', end_time);
            });
          });
      })
      .fetchAll();
  },
  async generateBookingReference() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    async function exists(ref) {
      const row = await knex('bookings').where({ booking_reference: ref }).first();
      return !!row;
    }
    let ref;
    do {
      const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      ref = `RB-${new Date().getFullYear()}-${rand}`;
    } while (await exists(ref));
    return ref;
  }
});
addCount(Booking);

module.exports = {
  Admin,
  Visitor,
  Room,
  Booking,
  knex
};