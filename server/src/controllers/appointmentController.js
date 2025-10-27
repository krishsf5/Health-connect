const Appointment = require('../models/Appointment');
const User = require('../models/User');

exports.listDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('_id name email specialization');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, reason, datetime, age, weight, severity } = req.body;

    if (!doctorId || !reason || !datetime || !age || !weight || !severity) {
      return res.status(400).json({ message: 'Doctor, reason, datetime, age, weight, and severity are required' });
    }

    const appt = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      reason,
      datetime: new Date(datetime),
      age,
      weight,
      severity
    });
    
    req.io.to(`user:${doctorId}`).emit('appointment:new', appt);
    res.status(201).json(appt);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.myAppointments = async (req, res) => {
  try {
    const role = req.user.role;
    const filter = role === 'doctor' ? { doctor: req.user.id } : { patient: req.user.id };
    const list = await Appointment.find(filter).sort({ createdAt: -1 }).populate('patient', 'name email').populate('doctor', 'name email');
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, newTime, meetingLink } = req.body;

    let update = {};
    if (status) update.status = status;
    if (newTime) {
      update.status = "rescheduled";
      update.rescheduledTime = new Date(newTime);
      update.datetime = new Date(newTime);
    }
    if (meetingLink !== undefined) {
      update.meetingLink = meetingLink;
    }

    const appt = await Appointment.findByIdAndUpdate(
      id,
      update,
      { new: true } // ✅ return updated document
    )
      .populate("patient", "name email")
      .populate("doctor", "name email");

    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    if (String(appt.doctor._id) !== req.user.id) {
      return res.status(403).json({ message: "Only that doctor can update" });
    }

    // ✅ Notify patient
    req.io.to(`user:${appt.patient._id}`).emit("appointment:update", appt);

    // ✅ Notify doctor
    req.io.to(`user:${appt.doctor._id}`).emit("appointment:update", appt);

    res.json(appt);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Append a doctor note to an appointment
exports.addAppointmentNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const appt = await Appointment.findById(id).populate('patient', 'name email').populate('doctor', 'name email');
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    if (String(appt.doctor._id) !== req.user.id) {
      return res.status(403).json({ message: 'Only that doctor can add notes' });
    }

    appt.notes = appt.notes || [];
    appt.notes.push({ author: req.user.id, text: text.trim() });
    await appt.save();

    // Re-populate to return latest
    const updated = await Appointment.findById(id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    // Notify patient and doctor
    req.io.to(`user:${updated.patient._id}`).emit('appointment:update', updated);
    req.io.to(`user:${updated.doctor._id}`).emit('appointment:update', updated);

    res.json(updated);
  } catch (err) {
    console.error('Add note error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for an appointment
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appt = await Appointment.findById(id)
      .populate('messages.author', 'name role')
      .populate('patient', 'name email')
      .populate('doctor', 'name email');
    
    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check user has access to this appointment
    if (String(appt.patient._id) !== req.user.id && String(appt.doctor._id) !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(appt.messages || []);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a chat message (doctor or patient) while appointment is active
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text required' });

    const appt = await Appointment.findById(id).populate('patient', 'name email').populate('doctor', 'name email');
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    // Only doctor or patient involved can send
    if (String(appt.doctor._id) !== req.user.id && String(appt.patient._id) !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Only while not completed/declined
    if (appt.status === 'completed' || appt.status === 'declined') {
      return res.status(400).json({ message: 'Chat closed for this appointment' });
    }

    appt.messages = appt.messages || [];
    appt.messages.push({ author: req.user.id, text: text.trim() });
    await appt.save();

    const updated = await Appointment.findById(id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .populate('messages.author', 'name role');

    req.io.to(`user:${updated.patient._id}`).emit('appointment:update', updated);
    req.io.to(`user:${updated.doctor._id}`).emit('appointment:update', updated);

    res.json(updated);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

