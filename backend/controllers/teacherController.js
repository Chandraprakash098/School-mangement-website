// const { Attendance, Homework, OnlineTest } = require('../models/');
const Attendance= require('../models/Attendance')
const Homework= require('../models/Homework')
const OnlineTest= require('../models/OnlineTest')
const User = require('../models/User');
const Remarks = require('../models/Remarks');
const moment = require('moment');

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
      student: studentId, 
      subject, 
      academicPerformance, 
      behaviorRemark, 
      overallComment,
      semester 
    } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
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
    const { title, subject, questions,duration } = req.body;

    if (!questions || questions.length !== 15) {
      return res.status(400).json({ message: 'Test must have exactly 15 questions' });
    }

    const onlineTest = new OnlineTest({
      title,
      subject,
      questions,
      teacher: req.user.id,
      duration: duration || 15
    });

    await onlineTest.save();
    res.status(201).json(onlineTest);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};



// In teacherController.js
exports.getUnevaluatedTests = async (req, res) => {
  try {
    const unevaluatedTests = await OnlineTest.find({
      'studentResponses.evaluated': false
    }).populate('studentResponses.student', 'name');

    res.json(unevaluatedTests);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Modify existing evaluateOnlineTest method to be more robust
exports.evaluateOnlineTest = async (req, res) => {
  try {
    const { testId, studentId, manualScore, feedback } = req.body;

    // Find the test by ID
    const test = await OnlineTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Find the student's response within the test
    const studentResponseIndex = test.studentResponses.findIndex(
      (resp) => resp.student.toString() === studentId
    );
    
    if (studentResponseIndex === -1) {
      return res.status(404).json({ message: 'Student response not found' });
    }

    // Automatic scoring logic (only if manual score is not provided)
    let finalScore = manualScore;
    
    if (manualScore === undefined) {
      let automaticScore = 0;
      const evaluatedResponses = test.studentResponses[studentResponseIndex].answers.map((response) => {
        const question = test.questions.find(
          (q) => q._id.toString() === response.questionId.toString()
        );

        if (!question) {
          console.warn(`Question with ID ${response.questionId} not found`);
          return response;
        }

        const correctOption = question.options.find((opt) => opt.isCorrect);
        if (!correctOption) {
          console.warn(`No correct option found for question ID ${question._id}`);
          return response;
        }

        const isCorrect = response.selectedOption === correctOption.text;
        if (isCorrect) automaticScore++;

        return {
          questionId: response.questionId,
          selectedOption: response.selectedOption,
          isCorrect,
        };
      });

      finalScore = automaticScore;
    }

    // Update the student response
    const studentResponse = test.studentResponses[studentResponseIndex];
    studentResponse.score = finalScore;
    studentResponse.evaluated = true;
    studentResponse.feedback = feedback || '';

    // Save the updated test
    await test.save();

    res.json({
      message: 'Test evaluated successfully',
      score: finalScore,
      feedback: studentResponse.feedback,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};