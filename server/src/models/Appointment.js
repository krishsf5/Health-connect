const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  datetime: { type: Date, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  severity: { type: Number, min: 1, max: 5 }, // ✅ severity included
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rescheduled', 'declined', 'completed'], 
    default: 'pending' 
  },
  rescheduledTime: { type: Date },
  meetingLink: { type: String }
}, { timestamps: true });

// Notes subdocument (author and text with timestamp)
appointmentSchema.add({
  notes: [
    new mongoose.Schema(
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
      },
      { _id: false, timestamps: { createdAt: true, updatedAt: false } }
    ),
  ],
});

// Chat messages subdocument
appointmentSchema.add({
  messages: [
    new mongoose.Schema(
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
      },
      { _id: false, timestamps: { createdAt: true, updatedAt: false } }
    ),
  ],
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
