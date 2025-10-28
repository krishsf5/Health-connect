const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  reportType: { 
    type: String, 
    enum: ['lab', 'xray', 'mri', 'ct', 'prescription', 'discharge', 'other'],
    default: 'other'
  },
  fileData: { type: String, required: true }, // Base64 encoded file
  fileName: { type: String, required: true },
  fileType: { type: String, required: true }, // MIME type
  fileSize: { type: Number, required: true }, // in bytes
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }, // Optional link to appointment
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
