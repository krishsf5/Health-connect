const jwt = require('jsonwebtoken');
const connectToDatabase = require('../_db');
const User = require('../_models/User');

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Login user
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if environment variables are set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
      console.error('Database connection string not found in environment variables');
      return res.status(500).json({ message: 'Database configuration error' });
    }

    await connectToDatabase();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization
    };

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);

    // If it's a database connection error, provide a more helpful message
    if (error.message.includes('MONGODB_URI') || error.message.includes('connection')) {
      return res.status(500).json({
        message: 'Database connection failed. Please check server configuration.',
        error: 'Database error'
      });
    }

    // If it's a JWT error, provide a helpful message
    if (error.message.includes('JWT_SECRET')) {
      return res.status(500).json({
        message: 'Authentication configuration error. Please check server configuration.',
        error: 'JWT error'
      });
    }

    res.status(500).json({
      message: 'Server error during login',
      error: error.message
    });
  }
}
