const express = require('express');
const router = express.Router();
const { Admin, Visitor, Room, Booking } = require('../models');
const { authenticateAdmin, requireSuperAdmin, generateToken } = require('../middleware/auth');
const { 
  validateAdminRegistration, 
  validateAdminLogin, 
  validateRoom, 
  validateId 
} = require('../middleware/validation');

// Admin Authentication Routes
router.post('/login', validateAdminLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (!admin.get('is_active')) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Validate password
    const isValidPassword = await admin.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(admin.toJSON(), 'admin');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: admin.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create new admin (Super admin only)
router.post('/register', authenticateAdmin, requireSuperAdmin, validateAdminRegistration, async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name, phone, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    const existingUsername = await Admin.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Hash password and create admin
    const hashedPassword = await Admin.hashPassword(password);
    const admin = await Admin.forge({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      role: role || 'admin'
    }).save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Get admin profile
router.get('/profile', authenticateAdmin, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.admin.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Room Management Routes
// Get all rooms
router.get('/rooms', authenticateAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, room_type, is_available } = req.query;
    
    let query = Room.forge();
    
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
    
    if (is_available !== undefined) {
      query = query.where('is_available', is_available === 'true');
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

// Get single room
router.get('/rooms/:id', authenticateAdmin, validateId, async (req, res, next) => {
  try {
    const room = await Room.where({ id: req.params.id }).fetch({
      withRelated: ['bookings.visitor']
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
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

// Create new room
router.post('/rooms', authenticateAdmin, validateRoom, async (req, res, next) => {
  try {
    const roomData = req.body;
    
    // Check if room number already exists
    const existingRoom = await Room.findByRoomNumber(roomData.room_number);
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists'
      });
    }

    // Convert amenities array to JSON string if provided
    if (roomData.amenities && Array.isArray(roomData.amenities)) {
      roomData.amenities = JSON.stringify(roomData.amenities);
    }

    const room = await Room.forge(roomData).save();

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Update room
router.put('/rooms/:id', authenticateAdmin, validateId, validateRoom, async (req, res, next) => {
  try {
    const room = await Room.where({ id: req.params.id }).fetch();
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const updateData = req.body;
    
    // Convert amenities array to JSON string if provided
    if (updateData.amenities && Array.isArray(updateData.amenities)) {
      updateData.amenities = JSON.stringify(updateData.amenities);
    }

    await room.save(updateData);

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Delete room
router.delete('/rooms/:id', authenticateAdmin, validateId, async (req, res, next) => {
  try {
    const room = await Room.where({ id: req.params.id }).fetch();
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    await room.destroy();

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Booking Management Routes
// Get all bookings
router.get('/bookings', authenticateAdmin, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      room_id, 
      date_from, 
      date_to,
      visitor_id 
    } = req.query;
    
    let query = Booking.forge();
    
    if (status) {
      query = query.where('status', status);
    }
    
    if (room_id) {
      query = query.where('room_id', room_id);
    }
    
    if (visitor_id) {
      query = query.where('visitor_id', visitor_id);
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
      withRelated: ['room', 'visitor', 'approvedBy']
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
router.get('/bookings/:id', authenticateAdmin, validateId, async (req, res, next) => {
  try {
    const booking = await Booking.where({ id: req.params.id }).fetch({
      withRelated: ['room', 'visitor', 'approvedBy']
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

// Approve booking
router.patch('/bookings/:id/approve', authenticateAdmin, validateId, async (req, res, next) => {
  try {
    const booking = await Booking.where({ id: req.params.id }).fetch();
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.get('status') !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be approved'
      });
    }

    await booking.save({
      status: 'confirmed',
      approved_by: req.user.id,
      approved_at: new Date()
    });

    const updatedBooking = await Booking.where({ id: req.params.id }).fetch({
      withRelated: ['room', 'visitor', 'approvedBy']
    });

    res.json({
      success: true,
      message: 'Booking approved successfully',
      data: updatedBooking.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Reject booking
router.patch('/bookings/:id/reject', authenticateAdmin, validateId, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.where({ id: req.params.id }).fetch();
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.get('status') !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be rejected'
      });
    }

    await booking.save({
      status: 'cancelled',
      cancellation_reason: reason,
      approved_by: req.user.id,
      approved_at: new Date()
    });

    const updatedBooking = await Booking.where({ id: req.params.id }).fetch({
      withRelated: ['room', 'visitor', 'approvedBy']
    });

    res.json({
      success: true,
      message: 'Booking rejected successfully',
      data: updatedBooking.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Visitor Management Routes
// Get all visitors
router.get('/visitors', authenticateAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, user_type, is_active } = req.query;
    
    let query = Visitor.forge();
    
    if (search) {
      query = query.where(function() {
        this.where('first_name', 'LIKE', `%${search}%`)
          .orWhere('last_name', 'LIKE', `%${search}%`)
          .orWhere('email', 'LIKE', `%${search}%`)
          .orWhere('student_id', 'LIKE', `%${search}%`);
      });
    }
    
    if (user_type) {
      query = query.where('user_type', user_type);
    }
    
    if (is_active !== undefined) {
      query = query.where('is_active', is_active === 'true');
    }

    const visitors = await query.fetchPage({
      page: parseInt(page),
      pageSize: parseInt(limit)
    });

    res.json({
      success: true,
      data: visitors.toJSON(),
      pagination: visitors.pagination
    });
  } catch (error) {
    next(error);
  }
});

// Get single visitor
router.get('/visitors/:id', authenticateAdmin, validateId, async (req, res, next) => {
  try {
    const visitor = await Visitor.where({ id: req.params.id }).fetch({
      withRelated: ['bookings.room']
    });

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    res.json({
      success: true,
      data: visitor.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate visitor
router.patch('/visitors/:id/deactivate', authenticateAdmin, validateId, async (req, res, next) => {
  try {
    const visitor = await Visitor.where({ id: req.params.id }).fetch();
    
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    await visitor.save({ is_active: false });

    res.json({
      success: true,
      message: 'Visitor deactivated successfully',
      data: visitor.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Activate visitor
router.patch('/visitors/:id/activate', authenticateAdmin, validateId, async (req, res, next) => {
  try {
    const visitor = await Visitor.where({ id: req.params.id }).fetch();
    
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    await visitor.save({ is_active: true });

    res.json({
      success: true,
      message: 'Visitor activated successfully',
      data: visitor.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Dashboard statistics
router.get('/dashboard/stats', authenticateAdmin, async (req, res, next) => {
  try {
    const totalRooms = await Room.count();
    const totalVisitors = await Visitor.count();
    const totalBookings = await Booking.count();
    const pendingBookings = await Booking.where('status', 'pending').count();
    const confirmedBookings = await Booking.where('status', 'confirmed').count();
    const todayBookings = await Booking.where('booking_date', new Date().toISOString().split('T')[0]).count();

    res.json({
      success: true,
      data: {
        totalRooms,
        totalVisitors,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        todayBookings
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;