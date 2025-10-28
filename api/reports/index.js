const { authRequired } = require('../_middleware/auth');
const connectToDatabase = require('../_db');
const Report = require('../_models/Report');

// Get all reports for the current user or upload a new report
export default async function handler(req, res) {
  try {
    const decoded = await authRequired(req);
    await connectToDatabase();

    // GET - Fetch all reports for the current user
    if (req.method === 'GET') {
      const reports = await Report.find({ patient: decoded.user.id })
        .sort({ createdAt: -1 })
        .populate('uploadedBy', 'name role')
        .populate('appointment', 'datetime reason')
        .select('-fileData'); // Exclude file data for list view

      return res.json(reports);
    }

    // POST - Upload a new report
    if (req.method === 'POST') {
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
        patient: decoded.user.id,
        title,
        description,
        reportType: reportType || 'other',
        fileData,
        fileName,
        fileType,
        fileSize,
        uploadedBy: decoded.user.id,
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

      return res.status(201).json(response);
    }

    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Reports error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
