const { authRequired } = require('../_middleware/auth');
const connectToDatabase = require('../_db');
const Appointment = require('../_models/Appointment');

// Get messages or send message in appointment chat
export default async function handler(req, res) {
  try {
    const decoded = await authRequired(req);
    await connectToDatabase();

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Missing appointment ID' });
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

    // GET - Fetch messages
    if (req.method === 'GET') {
      await appointment.populate([
        { path: 'doctor', select: 'name email specialization' },
        { path: 'patient', select: 'name email' },
        { path: 'messages.author', select: 'name role' }
      ]);
      
      return res.json(appointment.messages || []);
    }

    // POST - Send message
    if (req.method === 'POST') {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ message: 'Message text is required' });
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

      return res.json(appointment.messages || []);
    }

    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Messages error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
