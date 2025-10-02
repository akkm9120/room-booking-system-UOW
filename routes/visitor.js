const express = require('express');
const router = express.Router();
const { Visitor, Room, Booking } = require('../models');
const { authenticateVisitor, generateToken } = require('../middleware/auth');
const { 
  validateVisitorRegistration, 
  validateVisitorLogin, 
  validateBooking, 
  validateId 
} = require('../middleware/validation');

// Visitor Authentication Routes
router.post('/register', validateVisitorRegistration, async (req, res, next) => {
  try {
    const { 
      student_id, 
      email, 
      password, 
      first_name, 
      last_name, 
      phone, 
      user_type, 
      department 
    } = req.body;

    // Check if visitor already exists
    const existingVisitor = await Visitor.findByEmail(email);
    if (existingVisitor) {
      return res.status(400).json({
        success: false,
        message: 'Visitor with this email already exists'
      });
    }

    if (student_id) {
      const existingStudentId = await Visitor.findByStudentId(student_id);
      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already registered'
        });
      }
    }

    // Hash password and create visitor
    const hashedPassword = await Visitor.hashPassword(password);
    const visitor = await Visitor.forge({
      student_id,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      user_type: user_type || 'visitor',
      department
    }).save();

    // Generate token
    const token = generateToken(visitor.toJSON(), 'visitor');

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        visitor: visitor.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateVisitorLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find visitor by email
    const visitor = await Visitor.findByEmail(email);
    if (!visitor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if visitor is active
    if (!visitor.get('is_active')) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Validate password
    const isValidPassword = await visitor.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(visitor.toJSON(), 'visitor');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        visitor: visitor.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get visitor profile
router.get('/profile', authenticateVisitor, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.visitor.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Update visitor profile
router.put('/profile', authenticateVisitor, async (req, res, next) => {
  try {
    const { first_name, last_name, phone, department } = req.body;
    
    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;

    await req.visitor.save(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: req.visitor.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Room Routes
// Get all available rooms
router.get('/rooms', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      room_type, 
      capacity_min,
      capacity_max,
      date,
      start_time,
      end_time
    } = req.query;
    
    let query = Room.where('is_available', true);
    
    if (search) {
      query = query.where(function() {
        this.where('room_name', 'LIKE', `%${search}%`)
          .orWhere('room_number', 'LIKE', `%${search}%`)
          .orWhere('location', 'LIKE', `%${search}%`);
      });
    }
    
    if (room_type) {
      query = query.where('room_type', room_type);
    }
    
    if (capacity_min) {
      query = query.where('capacity', '>=', parseInt(capacity_min));
    }
    
    if (capacity_max) {
      query = query.where('capacity', '<=', parseInt(capacity_max));
    }

    // If date and time are provided, filter out rooms that are already booked
    if (date && start_time && end_time) {
      const conflictingBookings = await Booking
        .where('booking_date', date)
        .where('status', 'confirmed')
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
        })
        .fetchAll();

      const bookedRoomIds = conflictingBookings.map(booking => booking.get('room_id'));
      if (bookedRoomIds.length > 0) {
        query = query.whereNotIn('id', bookedRoomIds);
      }
    }

    const rooms = await query.fetchPage({
      page: parseInt(page),
      pageSize: parseInt(limit)
    });

    res.json({
      success: true,
      data: rooms.toJSON(),
      pagination: rooms.pagination
    });
  } catch (error) {
    next(error);
  }
});

// Get single room details
router.get('/rooms/:id', validateId, async (req, res, next) => {
  try {
    const room = await Room.where({ id: req.params.id, is_available: true }).fetch();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or not available'
      });
    }

    res.json({
      success: true,
      data: room.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Check room availability for specific date and time
router.get('/rooms/:id/availability', validateId, async (req, res, next) => {
  try {
    const { date, start_time, end_time } = req.query;
    
    if (!date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Date, start_time, and end_time are required'
      });
    }

    const room = await Room.where({ id: req.params.id, is_available: true }).fetch();
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or not available'
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.checkConflictingBookings(
      req.params.id,
      date,
      start_time,
      end_time
    );

    const isAvailable = conflictingBookings.length === 0;

    res.json({
      success: true,
      data: {
        room_id: req.params.id,
        date,
        start_time,
        end_time,
        is_available: isAvailable,
        conflicting_bookings: conflictingBookings.map(booking => ({
          id: booking.get('id'),
          start_time: booking.get('start_time'),
          end_time: booking.get('end_time'),
          status: booking.get('status')
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Booking Routes
// Create new booking
router.post('/bookings', authenticateVisitor, validateBooking, async (req, res, next) => {
  try {
    const {
      room_id,
      booking_date,
      start_time,
      end_time,
      purpose,
      description,
      attendees
    } = req.body;

    // Check if room exists and is available
    const room = await Room.where({ id: room_id, is_available: true }).fetch();
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or not available'
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.checkConflictingBookings(
      room_id,
      booking_date,
      start_time,
      end_time
    );

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for the selected time slot'
      });
    }

    // Generate booking reference
    const bookingReference = await Booking.generateBookingReference();

    // Calculate total cost
    const startDateTime = new Date(`${booking_date}T${start_time}`);
    const endDateTime = new Date(`${booking_date}T${end_time}`);
    const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    const totalCost = durationHours * room.get('hourly_rate');

    // Create booking
    const booking = await Booking.forge({
      room_id,
      visitor_id: req.user.id,
      booking_reference: bookingReference,
      booking_date,
      start_time,
      end_time,
      purpose,
      description,
      attendees: attendees || 1,
      status: room.get('requires_approval') ? 'pending' : 'confirmed',
      total_cost: totalCost
    }).save();

    // Fetch booking with related data
    const newBooking = await Booking.where({ id: booking.id }).fetch({
      withRelated: ['room', 'visitor']
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Get visitor's bookings
router.get('/bookings', authenticateVisitor, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, date_from, date_to } = req.query;
    
    let query = Booking.where('visitor_id', req.user.id);
    
    if (status) {
      query = query.where('status', status);
    }
    
    if (date_from) {
      query = query.where('booking_date', '>=', date_from);
    }
    
    if (date_to) {
      query = query.where('booking_date', '<=', date_to);
    }

    const bookings = await query.fetchPage({
      page: parseInt(page),
      pageSize: parseInt(limit),
      withRelated: ['room']
    });

    res.json({
      success: true,
      data: bookings.toJSON(),
      pagination: bookings.pagination
    });
  } catch (error) {
    next(error);
  }
});

// Get single booking
router.get('/bookings/:id', authenticateVisitor, validateId, async (req, res, next) => {
  try {
    const booking = await Booking.where({ 
      id: req.params.id, 
      visitor_id: req.user.id 
    }).fetch({
      withRelated: ['room', 'approvedBy']
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.patch('/bookings/:id/cancel', authenticateVisitor, validateId, async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.where({ 
      id: req.params.id, 
      visitor_id: req.user.id 
    }).fetch();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!['pending', 'confirmed'].includes(booking.get('status'))) {
      return res.status(400).json({
        success: false,
        message: 'Only pending or confirmed bookings can be cancelled'
      });
    }

    // Check if booking is in the past
    const bookingDateTime = new Date(`${booking.get('booking_date')}T${booking.get('start_time')}`);
    if (bookingDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel past bookings'
      });
    }

    await booking.save({
      status: 'cancelled',
      cancellation_reason: reason || 'Cancelled by visitor'
    });

    const updatedBooking = await Booking.where({ id: req.params.id }).fetch({
      withRelated: ['room']
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Update booking (only for pending bookings)
router.put('/bookings/:id', authenticateVisitor, validateId, validateBooking, async (req, res, next) => {
  try {
    const booking = await Booking.where({ 
      id: req.params.id, 
      visitor_id: req.user.id 
    }).fetch();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.get('status') !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be updated'
      });
    }

    const {
      room_id,
      booking_date,
      start_time,
      end_time,
      purpose,
      description,
      attendees
    } = req.body;

    // If room or time is being changed, check availability
    if (room_id !== booking.get('room_id') || 
        booking_date !== booking.get('booking_date') ||
        start_time !== booking.get('start_time') ||
        end_time !== booking.get('end_time')) {
      
      // Check if new room exists and is available
      const room = await Room.where({ id: room_id, is_available: true }).fetch();
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found or not available'
        });
      }

      // Check for conflicting bookings (excluding current booking)
      const conflictingBookings = await Booking
        .where('room_id', room_id)
        .where('booking_date', booking_date)
        .where('status', 'confirmed')
        .where('id', '!=', req.params.id)
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
        })
        .fetchAll();

      if (conflictingBookings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Room is already booked for the selected time slot'
        });
      }

      // Recalculate total cost if room or time changed
      const startDateTime = new Date(`${booking_date}T${start_time}`);
      const endDateTime = new Date(`${booking_date}T${end_time}`);
      const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
      const totalCost = durationHours * room.get('hourly_rate');

      await booking.save({
        room_id,
        booking_date,
        start_time,
        end_time,
        purpose,
        description,
        attendees: attendees || booking.get('attendees'),
        total_cost: totalCost
      });
    } else {
      // Only update non-time/room fields
      await booking.save({
        purpose,
        description,
        attendees: attendees || booking.get('attendees')
      });
    }

    const updatedBooking = await Booking.where({ id: req.params.id }).fetch({
      withRelated: ['room']
    });

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Get booking history
router.get('/bookings/history', authenticateVisitor, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const bookings = await Booking
      .where('visitor_id', req.user.id)
      .where('status', 'completed')
      .fetchPage({
        page: parseInt(page),
        pageSize: parseInt(limit),
        withRelated: ['room']
      });

    res.json({
      success: true,
      data: bookings.toJSON(),
      pagination: bookings.pagination
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;