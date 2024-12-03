const mongoose= require('mongoose')

const OnlineTestSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    questions: [{
      question: {
        type: String,
        required: true
      },
      options: [{
        text: String,
        isCorrect: Boolean
      }]
    }],
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentResponses: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOption: String,
        isCorrect: Boolean
      }],
      score: Number,
      evaluated: {
        type: Boolean,
        default: false
      },
      feedback: {
        type: String,
        default: ''
      }
    }]
  }, { timestamps: true });
  
  module.exports = mongoose.model('OnlineTest', OnlineTestSchema)
  