const { authRequired } = require('../_middleware/auth');
const connectToDatabase = require('../_db');
const Appointment = require('../_models/Appointment');

// Send message in appointment chat
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const decoded = await authRequired(req);
    await connectToDatabase();

    const { id } = req.query;
    const { text } = req.body;

    if (!id || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find appointment and verify user is part of it
    const appointment = await Appointment.findOne({
      _id: id,
      $or: [
        { patient: decoded.user.id },
        { doctor: decoded.user.id }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Add message
    appointment.messages.push({
      author: decoded.user.id,
      text: text.trim()
    });

    await appointment.save();

    // Populate for response
    await appointment.populate([
      { path: 'doctor', select: 'name email specialization' },
      { path: 'patient', select: 'name email' },
      { path: 'messages.author', select: 'name role' }
    ]);

    res.json(appointment);
  } catch (error) {
    console.error('Send message error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
