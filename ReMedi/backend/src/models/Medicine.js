const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  time: { type: String, required: true }, 
  taken: { type: Boolean, default: false },
  takenAt: { type: Date },
  repeat: { type: mongoose.Schema.Types.Mixed, default: 'daily' },
  missed: { type: Boolean, default: false },
  missedAt: { type: Date }
});

const MedicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  dose: { type: String },
  notes: { type: String },
  schedules: [ScheduleSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medicine', MedicineSchema);
