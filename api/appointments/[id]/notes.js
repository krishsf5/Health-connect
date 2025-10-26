const { authRequired, requireRole } = require('../_middleware/auth');
const connectToDatabase = require('../_db');
const Appointment = require('../_models/Appointment');

// Add note to appointment (doctor only)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const decoded = await requireRole('doctor')(req);
    await connectToDatabase();

    const { id } = req.query;
    const { text } = req.body;

    if (!id || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find appointment and verify doctor is assigned
    const appointment = await Appointment.findOne({
      _id: id,
      doctor: decoded.user.id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Add note
    appointment.notes.push({
      author: decoded.user.id,
      text: text.trim()
    });

    await appointment.save();

    // Populate for response
    await appointment.populate([
      { path: 'doctor', select: 'name email specialization' },
      { path: 'patient', select: 'name email' },
      { path: 'notes.author', select: 'name' }
    ]);

    res.json(appointment);
  } catch (error) {
    console.error('Add note error:', error);
    if (error.message === 'Forbidden') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
