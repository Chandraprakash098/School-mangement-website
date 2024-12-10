// // backend/models/Library.js
// const mongoose = require('mongoose');

// const LibrarySchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   author: {
//     type: String,
//     required: true
//   },
//   isbn: {
//     type: String,
//     unique: true,
//     required: true
//   },
//   category: {
//     type: String,
//     required: true
//   },
//   totalCopies: {
//     type: Number,
//     required: true
//   },
//   availableCopies: {
//     type: Number,
//     required: true
//   },
//   issuedBooks: [{
//     student: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     issueDate: Date,
//     returnDate: Date
//   }],
//   status: {
//     type: String,
//     enum: ['available', 'out of stock'],
//     default: 'available'
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Library', LibrarySchema);




// models/Library.js
const mongoose = require('mongoose');
const LibrarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  totalCopies: {
    type: Number,
    required: true
  },
  availableCopies: {
    type: Number,
    required: true
  },
  issuedBooks: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    issuedDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'issued', 'returned'],
      default: 'pending'
    },
    fineAmount: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});


module.exports = mongoose.model('Library', LibrarySchema);