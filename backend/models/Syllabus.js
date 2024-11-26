const mongoose = require('mongoose');

const SyllabusSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  topics: [{
    name: String,
    description: String
  }],
  recommendedBooks: [{
    title: String,
    author: String
  }],
  additionalResources: [String]
}, { timestamps: true });


module.exports =  mongoose.model('Syllabus', SyllabusSchema);