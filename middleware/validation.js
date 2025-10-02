const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Admin validation rules
const validateAdminRegistration = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('last_name')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['admin', 'super_admin'])
    .withMessage('Role must be either admin or super_admin'),
  handleValidationErrors
];

const validateAdminLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Visitor validation rules
const validateVisitorRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('last_name')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('student_id')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Student ID must be less than 20 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('user_type')
    .optional()
    .isIn(['student', 'staff', 'visitor'])
    .withMessage('User type must be student, staff, or visitor'),
  body('department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters'),
  handleValidationErrors
];

const validateVisitorLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Room validation rules
const validateRoom = [
  body('room_number')
    .isLength({ min: 1, max: 20 })
    .withMessage('Room number is required and must be less than 20 characters'),
  body('room_name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Room name is required and must be less than 100 characters'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('building')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Building must be less than 50 characters'),
  body('room_type')
    .optional()
    .isIn(['classroom', 'meeting_room', 'lab', 'auditorium', 'conference_room'])
    .withMessage('Invalid room type'),
  body('hourly_rate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  handleValidationErrors
];

// Booking validation rules
const validateBooking = [
  body('room_id')
    .isInt({ min: 1 })
    .withMessage('Valid room ID is required'),
  body('start_time')
    .isISO8601()
    .withMessage('Valid start time is required (ISO 8601 format)'),
  body('end_time')
    .isISO8601()
    .withMessage('Valid end time is required (ISO 8601 format)')
    .custom((endTime, { req }) => {
      if (new Date(endTime) <= new Date(req.body.start_time)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('booking_date')
    .isDate()
    .withMessage('Valid booking date is required')
    .custom((date) => {
      if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
        throw new Error('Booking date cannot be in the past');
      }
      return true;
    }),
  body('purpose')
    .isLength({ min: 1, max: 255 })
    .withMessage('Purpose is required and must be less than 255 characters'),
  body('expected_attendees')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Expected attendees must be a positive integer'),
  handleValidationErrors
];

// Parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required'),
  handleValidationErrors
];

module.exports = {
  validateAdminRegistration,
  validateAdminLogin,
  validateVisitorRegistration,
  validateVisitorLogin,
  validateRoom,
  validateBooking,
  validateId,
  handleValidationErrors
};