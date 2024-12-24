// backend/models/Remarks.js
// const mongoose = require('mongoose');

// const RemarksSchema = new mongoose.Schema({
//   student: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   teacher: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   subject: {
//     type: String,
//     required: true
//   },
//   academicPerformance: {
//     type: String,
//     enum: ['Excellent', 'Good', 'Average', 'Below Average'],
//     required: true
//   },
//   behaviorRemark: {
//     type: String,
//     required: true
//   },
//   overallComment: {
//     type: String
//   },
//   semester: {
//     type: String,
//     required: true
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Remarks', RemarksSchema);


const mongoose = require('mongoose');

const RemarksSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  academicPerformance: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Below Average'],
    required: true
  },
  behaviorRemark: {
    type: String,
    required: true
  },
  overallComment: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Remarks', RemarksSchema);