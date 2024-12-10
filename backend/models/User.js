// // backend/models/User.js
// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'student', 'teacher', 'transport', 'account','librarian'],
//     required: true
//   },
//   profile: {
//     type: mongoose.Schema.Types.Mixed
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('User', UserSchema);





// models/User.js
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'teacher', 'transport', 'account', 'librarian'],
    required: true
  },
  class: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  fatherName: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  motherName: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  address: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  profile: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);