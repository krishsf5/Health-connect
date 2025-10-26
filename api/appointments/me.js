const { authRequired } = require('../_middleware/auth');
const connectToDatabase = require('../_db');
const Appointment = require('../_models/Appointment');
const User = require('../_models/User');

// Get user's appointments (both patients and doctors)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const decoded = await authRequired(req);
    await connectToDatabase();

    let appointments;

    if (decoded.user.role === 'patient') {
      // Patients see their own appointments
      appointments = await Appointment.find({ patient: decoded.user.id })
        .populate('doctor', 'name email specialization')
        .sort({ datetime: -1 });
    } else {
      // Doctors see appointments where they are the doctor
      appointments = await Appointment.find({ doctor: decoded.user.id })
        .populate('patient', 'name email')
        .sort({ datetime: -1 });
    }

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
