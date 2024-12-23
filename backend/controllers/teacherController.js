// const { Attendance, Homework, OnlineTest } = require('../models/');
const Attendance= require('../models/Attendance')
const Homework= require('../models/Homework')
const OnlineTest= require('../models/OnlineTest')
const User = require('../models/User');
const Remarks = require('../models/Remarks');
const moment = require('moment');
const multer = require('multer');
const path = require('path');


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
//       student: student.id, // Make sure this matches the MongoDB ObjectId
//       subject,
//       class: studentClass,
//       date: attendanceDate,
//       status: student.status || 'absent', // Default to 'absent' if no status provided
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
//     res.status(500).json({
//       message: 'Server Error',
//       error: err.message
//     });
//   }
// };


// // Get Students for Attendance Assignment
// exports.getStudentsForAttendance = async (req, res) => {
//   try {
//     const { class: studentClass } = req.query;

//     // Find all students of the specified class
//     const students = await User.find({
//       role: 'student',
//       class: studentClass
//     }).select('name _id');

//     res.json(students);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };


exports.getStudentsForAttendance = async (req, res) => {
  try {
    const { class: studentClass } = req.query;

    if (!studentClass) {
      return res.status(400).json({ message: 'Class is required' });
    }

    // Find all students of the specified class
    const students = await User.find({
      role: 'student',
      class: studentClass
    }).select('name _id');

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found in this class' });
    }

    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// Check if attendance exists
exports.checkAttendanceExists = async (req, res) => {
  try {
    const { class: studentClass, subject, date } = req.query;

    // Validate required fields
    if (!studentClass || !subject || !date) {
      return res.status(400).json({ 
        message: 'Class, subject, and date are required' 
      });
    }

    // Parse the date string to a Date object
    const checkDate = new Date(date);
    // Set time to start of day for consistent comparison
    checkDate.setHours(0, 0, 0, 0);

    // Set end of day for date range query
    const endDate = new Date(checkDate);
    endDate.setHours(23, 59, 59, 999);

    // Check if attendance exists for this class, subject, and date
    const existingAttendance = await Attendance.findOne({
      class: studentClass,
      subject,
      date: {
        $gte: checkDate,
        $lte: endDate
      }
    });

    res.json(!!existingAttendance); // Returns true if attendance exists, false otherwise
  } catch (err) {
    console.error('Error checking attendance:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};




// exports.assignAttendance = async (req, res) => {
//   try {
//       const { students, subject, class: studentClass, date } = req.body;

//       // Validate input
//       if (!students || !Array.isArray(students) || students.length === 0) {
//           return res.status(400).json({ message: 'No students provided' });
//       }

//       if (!subject || !studentClass || !date) {
//           return res.status(400).json({ message: 'Subject, class and date are required' });
//       }

//       // Convert date string to Date object
//       const attendanceDate = new Date(date);
//       if (isNaN(attendanceDate.getTime())) {
//           return res.status(400).json({ message: 'Invalid date format' });
//       }

//       // Filter out invalid student IDs
//       const validStudents = students.filter(s => s.id && s.id.trim().length > 0);
      
//       if (validStudents.length === 0) {
//           return res.status(400).json({ message: 'No valid student IDs provided' });
//       }

//       // Check if attendance already exists
//       const startOfDay = new Date(attendanceDate);
//       startOfDay.setHours(0, 0, 0, 0);
//       const endOfDay = new Date(attendanceDate);
//       endOfDay.setHours(23, 59, 59, 999);

//       const existingAttendance = await Attendance.findOne({
//           class: studentClass,
//           subject,
//           date: {
//               $gte: startOfDay,
//               $lte: endOfDay
//           }
//       });

//       if (existingAttendance) {
//           return res.status(409).json({ message: 'Attendance already exists for this date' });
//       }

//       // Validate all students exist
//       const studentIds = validStudents.map(s => s.id);
//       const existingStudents = await User.find({
//           _id: { $in: studentIds },
//           role: 'student',
//           class: studentClass
//       });

//       if (existingStudents.length !== studentIds.length) {
//           return res.status(400).json({ message: 'Some student IDs are invalid' });
//       }

//       // Create attendance records
//       const attendanceRecords = validStudents.map(student => ({
//           student: student.id,
//           subject,
//           class: studentClass,
//           date: attendanceDate,
//           status: student.status.toLowerCase(),
//           teacher: req.user._id, // Make sure to use _id instead of id
//           year: attendanceDate.getFullYear(),
//           month: attendanceDate.getMonth() + 1,
//       }));

//       // Perform bulk insert
//       await Attendance.insertMany(attendanceRecords);

//       res.status(201).json({
//           message: 'Attendance submitted successfully',
//           recordsCreated: attendanceRecords.length
//       });
//   } catch (err) {
//       console.error('Attendance Assignment Error:', err);
//       res.status(500).json({
//           message: 'Server Error',
//           error: err.message
//       });
//   }
// };


exports.assignAttendance = async (req, res) => {
  try {
      const { students, subject, class: studentClass, date } = req.body;

      // Validate input
      if (!students || !Array.isArray(students) || students.length === 0) {
          return res.status(400).json({ message: 'No students provided' });
      }

      if (!subject || !studentClass || !date) {
          return res.status(400).json({ message: 'Subject, class and date are required' });
      }

      // Convert date string to Date object
      const attendanceDate = new Date(date);
      if (isNaN(attendanceDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date format' });
      }

      // Check if attendance already exists
      const startOfDay = new Date(attendanceDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(attendanceDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAttendance = await Attendance.findOne({
          class: studentClass,
          subject,
          date: {
              $gte: startOfDay,
              $lte: endOfDay
          }
      });

      if (existingAttendance) {
          return res.status(409).json({ message: 'Attendance already exists for this date' });
      }

      // Validate all students exist
      const studentIds = students.map(s => s.studentId);
      const existingStudents = await User.find({
          _id: { $in: studentIds },
          role: 'student',
          class: studentClass
      });

      if (existingStudents.length !== studentIds.length) {
          return res.status(400).json({ message: 'Some student IDs are invalid' });
      }

      // Create attendance records
      const attendanceRecords = students.map(student => ({
          student: new mongoose.Types.ObjectId(student.studentId),  // Convert to ObjectId
          subject,
          class: studentClass,
          date: attendanceDate,
          status: student.status.toLowerCase(),
          teacher: new mongoose.Types.ObjectId(req.user._id),  // Convert to ObjectId
          year: attendanceDate.getFullYear(),
          month: attendanceDate.getMonth() + 1
      }));

      // Perform bulk insert
      const result = await Attendance.insertMany(attendanceRecords);

      res.status(201).json({
          message: 'Attendance submitted successfully',
          recordsCreated: result.length
      });
  } catch (err) {
      console.error('Attendance Assignment Error:', err);
      if (err.name === 'CastError') {
          return res.status(400).json({
              message: 'Invalid ID format provided'
          });
      }
      res.status(500).json({
          message: 'Server Error',
          error: err.message
      });
  }
};


// Get Teacher's Assigned Attendance History
exports.getTeacherAttendanceHistory = async (req, res) => {
  try {
    const { class: studentClass, subject, date } = req.query;
    const query = { teacher: req.user.id };

    if (studentClass) query.class = studentClass;
    if (subject) query.subject = subject;
    if (date) {
      const searchDate = new Date(date);
      query.date = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lte: new Date(searchDate.setHours(23, 59, 59, 999))
      };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (err) {
    console.error('Error fetching attendance history:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};





const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/homework'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'homework-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

exports.getTeacherHomework = async (req, res) => {
  try {
    const homework = await Homework.find({ teacher: req.user.id })
      .populate('submissions.student', 'name email studentClass')
      .sort({ createdAt: -1 });
    
    res.json(homework);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.createHomework = async (req, res) => {
  upload.single("homeworkPdf")(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ 
        message: "File upload error", 
        error: uploadErr.message 
      });
    }

    try {
      const { title, description, subject, dueDate, studentClass } = req.body;

      // Validate input
      if (!title || !description || !subject || !dueDate || !studentClass) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ message: 'Homework PDF file is required' });
      }

      const homework = new Homework({
        title,
        description,
        subject,
        dueDate,
        studentClass,
        teacher: req.user.id,
        homeworkPdf: req.file.path  // Save the PDF file path
      });

      await homework.save();
      res.status(201).json({
        message: "Homework assigned successfully",
        homework,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });
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