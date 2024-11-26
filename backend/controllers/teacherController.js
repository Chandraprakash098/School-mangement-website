
// const { Attendance, Homework, OnlineTest } = require('../models/');
const Attendance= require('../models/Attendance')
const Homework= require('../models/Homework')
const OnlineTest= require('../models/OnlineTest')
const User = require('../models/User');
const Remarks = require('../models/Remarks');

// Assign Attendance
exports.assignAttendance = async (req, res) => {
  try {
    const { studentId, status, date } = req.body;

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendance = new Attendance({
      student: studentId,
      date: date || new Date(),
      status,
      teacher: req.user.id
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Create Homework
exports.createHomework = async (req, res) => {
  try {
    const { title, description, subject, dueDate, studentClass } = req.body;

    const homework = new Homework({
      title,
      description,
      subject,
      dueDate,
      studentClass,
      teacher: req.user.id
    });

    await homework.save();
    res.status(201).json(homework);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Create Remarks
const mongoose = require('mongoose');

exports.createRemarks = async (req, res) => {
  try {
    const { 
      studentId, 
      subject, 
      academicPerformance, 
      behaviorRemark, 
      overallComment,
      semester 
    } = req.body;

    // Validate ObjectId format
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ message: 'Invalid studentId format' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const remarks = new Remarks({
      student: studentId,
      teacher: req.user.id,
      subject,
      academicPerformance,
      behaviorRemark,
      overallComment,
      semester
    });

    await remarks.save();
    res.status(201).json(remarks);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


// Create Online Test
exports.createOnlineTest = async (req, res) => {
  try {
    const { title, subject, questions } = req.body;

    if (!questions || questions.length !== 15) {
      return res.status(400).json({ message: 'Test must have exactly 15 questions' });
    }

    const onlineTest = new OnlineTest({
      title,
      subject,
      questions,
      teacher: req.user.id
    });

    await onlineTest.save();
    res.status(201).json(onlineTest);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Evaluate Online Test
exports.evaluateOnlineTest = async (req, res) => {
  try {
    const { testId, studentId, responses } = req.body;

    const test = await OnlineTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    let score = 0;
    const evaluatedResponses = responses.map(response => {
      const question = test.questions.find(q => q._id.toString() === response.questionId);
      const correctOption = question.options.find(opt => opt.isCorrect);
      
      const isCorrect = response.selectedOption === correctOption.text;
      if (isCorrect) score++;

      return {
        questionId: response.questionId,
        selectedOption: response.selectedOption,
        isCorrect
      };
    });

    // Update test with student's response
    const existingResponseIndex = test.studentResponses.findIndex(
      resp => resp.student.toString() === studentId
    );

    if (existingResponseIndex > -1) {
      test.studentResponses[existingResponseIndex] = {
        student: studentId,
        answers: evaluatedResponses,
        score,
        evaluated: true
      };
    } else {
      test.studentResponses.push({
        student: studentId,
        answers: evaluatedResponses,
        score,
        evaluated: true
      });
    }

    await test.save();
    res.json({ score, responses: evaluatedResponses });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};