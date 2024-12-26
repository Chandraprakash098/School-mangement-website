const mongoose = require('mongoose');

const lecturePeriodSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add methods to check for period conflicts
lecturePeriodSchema.statics.checkConflict = async function(teacherId, dayOfWeek, startTime, endTime, excludePeriodId = null) {
  const query = {
    teacher: teacherId,
    dayOfWeek,
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };
  
  if (excludePeriodId) {
    query._id = { $ne: excludePeriodId };
  }
  
  const conflictingPeriod = await this.findOne(query);
  return conflictingPeriod;
};

module.exports = mongoose.model('LecturePeriod', lecturePeriodSchema);