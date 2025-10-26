const jwt = require('jsonwebtoken');
const connectToDatabase = require('../_db');
const User = require('../_models/User');

// Authentication middleware for serverless functions
async function authRequired(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists
    await connectToDatabase();
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return {
      ...decoded,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization
      }
    };
  } catch (err) {
    throw new Error('Invalid token');
  }
}

function requireRole(role) {
  return async (req) => {
    const decoded = await authRequired(req);
    if (!decoded.user || decoded.user.role !== role) {
      throw new Error('Forbidden');
    }
    return decoded;
  };
}

module.exports = { authRequired, requireRole };
