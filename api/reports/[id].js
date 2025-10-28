const { authRequired } = require('../_middleware/auth');
const connectToDatabase = require('../_db');
const Report = require('../_models/Report');

// Get or delete a specific report
export default async function handler(req, res) {
  try {
    const decoded = await authRequired(req);
    await connectToDatabase();

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Report ID is required' });
    }

    // GET - Fetch a specific report with file data
    if (req.method === 'GET') {
      const report = await Report.findOne({
        _id: id,
        patient: decoded.user.id
      })
        .populate('uploadedBy', 'name role')
        .populate('appointment', 'datetime reason');

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      return res.json(report);
    }

    // DELETE - Delete a report
    if (req.method === 'DELETE') {
      const report = await Report.findOne({
        _id: id,
        patient: decoded.user.id
      });

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      await Report.deleteOne({ _id: id });

      return res.json({ message: 'Report deleted successfully' });
    }

    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Report operation error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}
