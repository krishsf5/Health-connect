const { authRequired, requireRole } = require('../_middleware/auth');
const connectToDatabase = require('../_db');
const Appointment = require('../_models/Appointment');
const User = require('../_models/User');

// Create new appointment (patient only)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const decoded = await requireRole('patient')(req);
    await connectToDatabase();

    const { doctorId, reason, datetime, age, weight, severity } = req.body;

    if (!doctorId || !reason || !datetime || !age || !weight) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify doctor exists and is actually a doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: decoded.user.id,
      doctor: doctorId,
      reason,
      datetime: new Date(datetime),
      age: parseInt(age),
      weight: parseFloat(weight),
      severity: severity ? parseInt(severity) : undefined,
      status: 'pending'
    });

    // Populate doctor and patient info
    await appointment.populate([
      { path: 'doctor', select: 'name email specialization' },
      { path: 'patient', select: 'name email' }
    ]);

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    if (error.message === 'Forbidden') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
