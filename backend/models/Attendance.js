// const mongoose = require('mongoose');

// const AttendanceSchema = new mongoose.Schema({
//   student: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   date: {
//     type: Date,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['present', 'absent', 'late'],
//     required: true
//   },
//   teacher: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   }
// },{
//   index: { student: 1, date: 1 },
// });

// module.exports = mongoose.model('Attendance', AttendanceSchema);




const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true
  }
},{
  timestamps: true,
  index: { student: 1, date: 1, subject: 1, class: 1 }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);