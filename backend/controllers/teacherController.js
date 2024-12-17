// const { Attendance, Homework, OnlineTest } = require('../models/');
const Attendance= require('../models/Attendance')
const Homework= require('../models/Homework')
const OnlineTest= require('../models/OnlineTest')
const User = require('../models/User');
const Remarks = require('../models/Remarks');
const moment = require('moment');


// Assign Attendance for multiple students
// exports.assignAttendance = async (req, res) => {
//   try {
//     const { 
//       students, 
//       subject, 
//       class: studentClass, 
//       date 
//     } = req.body;

//     // Validate input
//     if (!students || !Array.isArray(students) || students.length === 0) {
//       return res.status(400).json({ message: 'No students provided' });
//     }

//     // Convert date to a Date object if it's a valid string
//     const attendanceDate = date ? new Date(date) : new Date();
//     if (isNaN(attendanceDate.getTime())) {
//       return res.status(400).json({ message: 'Invalid date format' });
//     }

//     // Prepare bulk write operations
//     const bulkOperations = students.map(student => ({
//       student: student.id,
//       subject,
//       class: studentClass,
//       date: attendanceDate,
//       status: student.status,
//       teacher: req.user.id,
//       year: attendanceDate.getFullYear(),
//       month: attendanceDate.getMonth() + 1, // January is 0, December is 11
//     }));

//     // Perform bulk insert
//     const attendanceRecords = await Attendance.insertMany(bulkOperations);

//     res.status(201).json({
//       message: 'Attendance assigned successfully',
//       recordsCreated: attendanceRecords.length,
//     });
//   } catch (err) {
//     console.error('Attendance Assignment Error:', err);
//     res.status(500).send('Server Error');
//   }
// };


exports.assignAttendance = async (req, res) => {
  try {
    const { 
      students, 
      subject, 
      class: studentClass, 
      date 
    } = req.body;

    // Validate input
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'No students provided' });
    }

    // Convert date to a Date object if it's a valid string
    const attendanceDate = date ? new Date(date) : new Date();
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Prepare bulk write operations
    const bulkOperations = students.map(student => ({
      student: student.id, // Make sure this matches the MongoDB ObjectId
      subject,
      class: studentClass,
      date: attendanceDate,
      status: student.status || 'absent', // Default to 'absent' if no status provided
      teacher: req.user.id,
      year: attendanceDate.getFullYear(),
      month: attendanceDate.getMonth() + 1, // January is 0, December is 11
    }));

    // Perform bulk insert
    const attendanceRecords = await Attendance.insertMany(bulkOperations);

    res.status(201).json({
      message: 'Attendance assigned successfully',
      recordsCreated: attendanceRecords.length,
    });
  } catch (err) {
    console.error('Attendance Assignment Error:', err);
    res.status(500).json({
      message: 'Server Error',
      error: err.message
    });
  }
};


// Get Students for Attendance Assignment
exports.getStudentsForAttendance = async (req, res) => {
  try {
    const { class: studentClass } = req.query;

    // Find all students of the specified class
    const students = await User.find({
      role: 'student',
      class: studentClass
    }).select('name _id');

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};





exports.createHomework = async (req, res) => {
  try {
    const { title, description, subject, dueDate, studentClass } = req.body;

    // Validate input
    if (!title || !description || !subject || !dueDate || !studentClass) {
      return res.status(400).json({ message: 'All fields are required' });
    }

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

// Get Homework Submissions for a specific homework
exports.getHomeworkSubmissions = async (req, res) => {
  try {
    const { homeworkId } = req.params;

    // Find homework and ensure it belongs to the current teacher
    const homework = await Homework.findOne({
      _id: homeworkId,
      teacher: req.user.id
    }).populate('submissions.student', 'name email class');

    if (!homework) {
      return res.status(404).json({ message: 'Homework not found or not assigned by you' });
    }

    res.json(homework.submissions);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Grade and provide feedback for homework submission
exports.gradeHomeworkSubmission = async (req, res) => {
  try {
    const { homeworkId, submissionId } = req.params;
    const { grade, feedback } = req.body;

    const homework = await Homework.findById(homeworkId);

    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    const submission = homework.submissions.id(submissionId);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback;

    await homework.save();

    res.json({
      message: 'Homework submission graded successfully',
      submission
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Endpoint to download submitted homework PDF
exports.downloadHomeworkSubmission = async (req, res) => {
  try {
    const { homeworkId, submissionId } = req.params;

    const homework = await Homework.findById(homeworkId);

    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    const submission = homework.submissions.id(submissionId);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.download(submission.pdfUrl);
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