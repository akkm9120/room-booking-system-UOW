// Import all models to register them with Bookshelf
const Admin = require('./Admin');
const Visitor = require('./Visitor');
const Room = require('./Room');
const Booking = require('./Booking');
const RoomAvailability = require('./RoomAvailability');

module.exports = {
  Admin,
  Visitor,
  Room,
  Booking,
  RoomAvailability
};