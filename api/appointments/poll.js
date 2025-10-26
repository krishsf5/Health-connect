const { authRequired } = require('../_middleware/auth');
const connectToDatabase = require('../_db');
const Appointment = require('../_models/Appointment');

// Poll for appointment updates (replaces Socket.IO)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const decoded = await authRequired(req);
    await connectToDatabase();

    const { lastUpdate } = req.query;
    let query = {};

    if (decoded.user.role === 'patient') {
      query.patient = decoded.user.id;
    } else {
      query.doctor = decoded.user.id;
    }

    // Get recent appointments since last update
    const since = lastUpdate ? new Date(lastUpdate) : new Date(Date.now() - 60000); // Default to last minute

    const appointments = await Appointment.find({
      ...query,
      updatedAt: { $gte: since }
    })
    .populate('doctor', 'name email specialization')
    .populate('patient', 'name email')
    .sort({ updatedAt: -1 });

    res.json({
      appointments,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Poll updates error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
