const PatientNote = require('../models/PatientNote');
const Appointment = require('../models/Appointment');

// Ensure doctor has relationship with patient
const verifyDoctorPatientAccess = async (doctorId, patientId) => {
  const appointment = await Appointment.findOne({
    doctor: doctorId,
    patient: patientId,
  });
  return !!appointment;
};

exports.listNotesForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }

    const hasAccess = await verifyDoctorPatientAccess(req.user.id, patientId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this patient.' });
    }

    const notes = await PatientNote.find({
      doctor: req.user.id,
      patient: patientId,
    })
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('List patient notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { patientId, title, content } = req.body;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }

    if (!patientId || !content?.trim()) {
      return res.status(400).json({ message: 'Patient and content are required.' });
    }

    const hasAccess = await verifyDoctorPatientAccess(req.user.id, patientId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this patient.' });
    }

    const note = await PatientNote.create({
      doctor: req.user.id,
      patient: patientId,
      title: title?.trim() || undefined,
      content: content.trim(),
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Create patient note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }

    const note = await PatientNote.findOne({ _id: id, doctor: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();

    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Update patient note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }

    const note = await PatientNote.findOneAndDelete({ _id: id, doctor: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete patient note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
