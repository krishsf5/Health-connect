const { authRequired } = require('../_middleware/auth');
const connectToDatabase = require('../_db');
const User = require('../_models/User');

// Get current user info
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const decoded = await authRequired(req);
    await connectToDatabase();

    const user = await User.findById(decoded.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization
    });
  } catch (error) {
    console.error('Me error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
