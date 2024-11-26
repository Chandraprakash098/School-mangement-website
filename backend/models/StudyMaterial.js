const mongoose = require('mongoose')

const StudyMaterialSchema = new mongoose.Schema({
    title: {
      type: String,
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
    type: {
      type: String,
      enum: ['notes', 'presentation', 'video', 'worksheet'],
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    description: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, { timestamps: true });
  
  module.exports =  mongoose.model('StudyMaterial', StudyMaterialSchema);
  