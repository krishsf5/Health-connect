const Report = require('../models/Report');

// Get all reports for the current user
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name role')
      .populate('appointment', 'datetime reason')
      .select('-fileData'); // Exclude file data for list view

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload a new report
exports.uploadReport = async (req, res) => {
  try {
    const { title, description, reportType, fileData, fileName, fileType, fileSize, appointmentId } = req.body;

    if (!title || !fileData || !fileName || !fileType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate file size (max 5MB)
    if (fileSize > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size exceeds 5MB limit' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, and PDF are allowed' });
    }

    const report = new Report({
      patient: req.user.id,
      title,
      description,
      reportType: reportType || 'other',
      fileData,
      fileName,
      fileType,
      fileSize,
      uploadedBy: req.user.id,
      appointment: appointmentId || undefined
    });

    await report.save();

    // Populate before sending response
    await report.populate([
      { path: 'uploadedBy', select: 'name role' },
      { path: 'appointment', select: 'datetime reason' }
    ]);

    // Remove fileData from response
    const response = report.toObject();
    delete response.fileData;

    res.status(201).json(response);
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific report with file data
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('uploadedBy', 'name role')
      .populate('appointment', 'datetime reason');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check access permissions
    const isOwner = report.patient.toString() === req.user.id;
    let hasAccess = isOwner;

    // If user is a doctor, check if they have appointments with this patient
    if (req.user.role === 'doctor' && !isOwner) {
      const Appointment = require('../models/Appointment');
      const hasAppointment = await Appointment.findOne({
        doctor: req.user.id,
        patient: report.patient
      });
      hasAccess = !!hasAppointment;
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a report
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      patient: req.user.id
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await Report.deleteOne({ _id: req.params.id });

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reports for a specific patient (Doctor access)
exports.getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify the requesting user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }

    // Optional: Verify doctor has appointments with this patient
    const Appointment = require('../models/Appointment');
    const hasAppointment = await Appointment.findOne({
      doctor: req.user.id,
      patient: patientId
    });

    if (!hasAppointment) {
      return res.status(403).json({ message: 'You do not have access to this patient\'s reports' });
    }

    const reports = await Report.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name role')
      .populate('appointment', 'datetime reason')
      .select('-fileData'); // Exclude file data for list view

    res.json(reports);
  } catch (error) {
    console.error('Get patient reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
