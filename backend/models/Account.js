const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  bankDetails: {
    accountNumber: {
      type: String,
      required: true
    },
    bankName: {
      type: String,
      required: true
    },
    ifscCode: {
      type: String,
      required: true
    }
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract'],
    required: true
  },
  joinDate: {
    type: Date,
    required: true
  },
  contactInformation: {
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    address: {
      permanentAddress: String,
      currentAddress: String
    }
  },
  documents: [{
    documentType: String,
    documentUrl: String,
    uploadDate: Date
  }]
}, { timestamps: true });

// Export the model
module.exports = mongoose.model('Account', AccountSchema);
