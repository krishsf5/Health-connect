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

// Register new doctor account
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

    const { name, email, password, specialization, experience } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!specialization) {
      return res.status(400).json({ message: 'Specialization is required for doctors' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create doctor user - ALWAYS set role to 'doctor'
    const user = new User({
      name,
      email,
      password,
      role: 'doctor', // IMPORTANT: Always set role to doctor
      specialization,
      experience
    });

    await user.save();

    console.log(`✅ Doctor created: ${name} (${email}) - Role: ${user.role}`);

    const token = signToken(user);
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization
    };

    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    console.error('Doctor registration error:', error);

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
      message: 'Server error during doctor registration',
      error: error.message
    });
  }
}
