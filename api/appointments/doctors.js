const { authRequired } = require('../_middleware/auth');
const connectToDatabase = require('../_db');
const User = require('../_models/User');

// Get list of doctors
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authRequired(req); // Verify authentication
    await connectToDatabase();

    const doctors = await User.find({ role: 'doctor' })
      .select('name email specialization')
      .sort({ name: 1 });

    res.json(doctors);
  } catch (error) {
    console.error('List doctors error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
