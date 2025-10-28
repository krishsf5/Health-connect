const mongoose = require('mongoose');

const patientNoteSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, trim: true },
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('PatientNote', patientNoteSchema);
