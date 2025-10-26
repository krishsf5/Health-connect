const { authRequired, requireRole } = require('../_middleware/auth');
const connectToDatabase = require('../_db');
const Appointment = require('../_models/Appointment');

// Update appointment status (doctor only)
export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const decoded = await requireRole('doctor')(req);
    await connectToDatabase();

    const { id } = req.query;
    const { status, meetingLink } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate status
    const validStatuses = ['accepted', 'rescheduled', 'declined', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find appointment and verify doctor is assigned
    const appointment = await Appointment.findOne({
      _id: id,
      doctor: decoded.user.id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update appointment
    appointment.status = status;

    if (status === 'accepted' && meetingLink) {
      appointment.meetingLink = meetingLink;
    }

    if (status === 'rescheduled' && meetingLink) {
      appointment.meetingLink = meetingLink;
    }

    await appointment.save();

    // Populate for response
    await appointment.populate([
      { path: 'doctor', select: 'name email specialization' },
      { path: 'patient', select: 'name email' }
    ]);

    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    if (error.message === 'Forbidden') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
