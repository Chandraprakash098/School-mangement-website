// const { Attendance, Homework, OnlineTest } = require('../models/');
const Attendance= require('../models/Attendance')
const Homework= require('../models/Homework')
const OnlineTest= require('../models/OnlineTest')
const Library = require('../models/Library');
const Syllabus = require('../models/Syllabus');
const StudyMaterial = require('../models/StudyMaterial');
const Remarks = require('../models/Remarks');
const Transport = require('../models/Transport');

// Get Student Attendance
// exports.getAttendance = async (req, res) => {
//   try {
//     const attendance = await Attendance.find({ student: req.user.id })
//       .sort({ date: -1 });
//     res.json(attendance);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };

exports.getAttendance = async (req, res) => {
  try {
    console.log('Authenticated User Id:', req.user.id);
    console.log('Attendance Request User ID Type:', typeof req.user.id);

    const attendance = await Attendance.find({ student: req.user.id })
      .sort({ date: -1 });

      console.log('Found Attendance:', attendance);
    
    // Calculate attendance percentage
    const totalAttendance = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalAttendance > 0 
      ? Math.round((presentDays / totalAttendance) * 100) 
      : 0;

    res.json({
      attendanceList: attendance,
      attendancePercentage: attendancePercentage
    });
  } catch (err) {
    console.error('Detailed Error:', err);
    res.status(500).send('Server Error');
  }
};




exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user.id })
      .sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get Homework
exports.getHomework = async (req, res) => {
  try {
    console.log('Authenticated User Id:', req.user.id);
    console.log('Attendance Request User ID Type:', typeof req.user.id);

    const homework = await Homework.find()
      .sort({ createdAt: -1 });
    res.json(homework);
  } catch (err) {
    console.error('Detailed Error:', err);
    res.status(500).send('Server Error');
  }
};

// Issue Library Book
const mongoose = require('mongoose');

exports.issueBook = async (req, res) => {
  try {
    const { bookId } = req.body;

    // Validate bookId
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    const book = await Library.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.isIssued) {
      return res.status(400).json({ message: 'Book is already issued' });
    }

    book.isIssued = true;
    book.issuedTo = req.user.id;
    book.issuedDate = new Date();

    await book.save();

    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


// Get Syllabus
exports.getSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.find()
      .sort({ createdAt: -1 });
    res.json(syllabus);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get Student Remarks
exports.getRemarks = async (req, res) => {
  try {
    const remarks = await Remarks.find({ student: req.user.id })
      .sort({ createdAt: -1 });
    res.json(remarks);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get Study Material
exports.getStudyMaterial = async (req, res) => {
  try {
    const studyMaterial = await StudyMaterial.find()
      .sort({ createdAt: -1 });
    res.json(studyMaterial);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get Transport Details
exports.getTransportDetails = async (req, res) => {
  try {
    const transportDetails = await Transport.find({ student: req.user.id });
    res.json(transportDetails);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Return Library Book
exports.returnBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Library.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.issuedTo.toString() !== req.user.id) {
      return res.status(400).json({ message: 'You did not issue this book' });
    }

    book.isIssued = false;
    book.issuedTo = null;
    book.issuedDate = null;

    await book.save();

    res.json({ message: 'Book returned successfully', book });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Update Homework Status
exports.updateHomeworkStatus = async (req, res) => {
  try {
    const { homeworkId, status } = req.body;

    const homework = await Homework.findById(homeworkId);

    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    homework.status = status;
    await homework.save();

    res.json({ message: 'Homework status updated', homework });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Get Online Test Results
exports.getOnlineTestResults = async (req, res) => {
  try {
    const onlineTestResults = await OnlineTest.find({ student: req.user.id })
      .sort({ testDate: -1 });
    res.json(onlineTestResults);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};




// In studentController.js
exports.submitOnlineTest = async (req, res) => {
  try {
    const { testId, responses } = req.body;

    // Find the online test
    const test = await OnlineTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Prepare student's responses
    const studentResponses = responses.map(response => ({
      questionId: response.questionId,
      selectedOption: response.selectedOption
    }));

    // Check if student has already submitted responses
    const existingResponseIndex = test.studentResponses.findIndex(
      resp => resp.student.toString() === req.user.id
    );

    if (existingResponseIndex > -1) {
      // Update existing response
      test.studentResponses[existingResponseIndex] = {
        student: req.user.id,
        answers: studentResponses,
        score: 0,
        evaluated: false
      };
    } else {
      // Add new response
      test.studentResponses.push({
        student: req.user.id,
        answers: studentResponses,
        score: 0,
        evaluated: false
      });
    }

    await test.save();

    res.json({ 
      message: 'Test submitted successfully', 
      testId: test._id 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Add a method to get available online tests for students
exports.getAvailableOnlineTests = async (req, res) => {
  try {
    const tests = await OnlineTest.find()
      .select('-questions.options.isCorrect') // Exclude correct answers
      .sort({ createdAt: -1 });
    
    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Add a method for students to view their test results
exports.getStudentTestResults = async (req, res) => {
  try {
    const tests = await OnlineTest.find({
      'studentResponses.student': req.user.id
    }).select('-questions.options.isCorrect');
    
    // Filter to only include tests where the student has a response
    const studentTests = tests.filter(test => 
      test.studentResponses.some(resp => 
        resp.student.toString() === req.user.id && resp.evaluated
      )
    );

    res.json(studentTests);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};