// const mongoose = require('mongoose');
// const HomeworkSchema = new mongoose.Schema({
//     title: {
//       type: String,
//       required: true
//     },
//     description: {
//       type: String,
//       required: true
//     },
//     subject: {
//       type: String,
//       required: true
//     },
//     dueDate: {
//       type: Date,
//       required: true
//     },
//     teacher: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true
//     },
//     studentClass: {
//       type: String,
//       required: true
//     }
//   }, { timestamps: true });

// module.exports = mongoose.model('Homework', HomeworkSchema);



const mongoose = require('mongoose');

const HomeworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentClass: {
    type: String,
    required: true
  },
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pdfUrl: {
      type: String,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    feedback: {
      type: String,
      default: null
    },
    grade: {
      type: String,
      default: null
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Homework', HomeworkSchema);