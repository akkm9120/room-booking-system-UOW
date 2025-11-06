const jwt = require('jsonwebtoken');
const { Admin, Visitor } = require('../models');

// Generate JWT token
const generateToken = (user, userType) => {
  const tokenPayload = { 
    id: user.id, 
    email: user.email, 
    userType: userType
  };
  
  // For admin users, include their role (super_admin or admin)
  if (userType === 'admin' && user.role) {
    tokenPayload.role = user.role;
  }
  
  return jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// General authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);
    
    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Verify admin still exists and is active
    const admin = await Admin.where({ id: decoded.id, is_active: true }).fetch();
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found or inactive'
      });
    }

    req.user = decoded;
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Visitor authentication middleware
const authenticateVisitor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded.userType !== 'visitor') {
      return res.status(403).json({
        success: false,
        message: 'Visitor access required'
      });
    }

    // Verify visitor still exists and is active
    const visitor = await Visitor.where({ id: decoded.id, is_active: true }).fetch();
    if (!visitor) {
      return res.status(401).json({
        success: false,
        message: 'Visitor account not found or inactive'
      });
    }

    req.user = decoded;
    req.visitor = visitor;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Super admin authorization middleware
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.get('role') !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  authenticateAdmin,
  authenticateVisitor,
  requireSuperAdmin
};