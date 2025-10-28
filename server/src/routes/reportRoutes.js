const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const {
  getAllReports,
  uploadReport,
  getReportById,
  deleteReport,
  getPatientReports
} = require('../controllers/reportController');

// All routes require authentication
router.use(authRequired);

// GET /api/reports - Get all reports for current user
router.get('/', getAllReports);

// POST /api/reports - Upload a new report
router.post('/', uploadReport);

// GET /api/reports/patient/:patientId - Get reports for a specific patient (Doctor only)
router.get('/patient/:patientId', getPatientReports);

// GET /api/reports/:id - Get specific report with file data
router.get('/:id', getReportById);

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', deleteReport);

module.exports = router;
