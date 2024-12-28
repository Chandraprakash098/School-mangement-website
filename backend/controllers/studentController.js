// const { Attendance, Homework, OnlineTest } = require('../models/');
const Attendance = require("../models/Attendance");
const Homework = require("../models/Homework");
const OnlineTest = require("../models/OnlineTest");
const Library = require("../models/Library");
const Syllabus = require("../models/Syllabus");
const StudyMaterial = require("../models/StudyMaterial");
const Remarks = require("../models/Remarks");
const Transport = require("../models/Transport");
const Fees = require("../models/Account");
const SportsEvent = require("../models/SportsEvent")
const multer = require("multer");
const path = require("path");
const fs= require('fs')


exports.getAttendance = async (req, res) => {
  try {
    const { year, month, subject } = req.query;

    // Validate input
    if (!year || !month || !subject) {
      return res.status(400).json({
        message: "Year, month, and subject are required",
      });
    }

    // Find attendance records matching criteria
    const attendance = await Attendance.find({
      student: req.user.id,
      year: parseInt(year),
      month: parseInt(month),
      subject,
    }).sort({ date: 1 });

    // Calculate attendance statistics
    const totalClasses = attendance.length;
    const presentClasses = attendance.filter(
      (a) => a.status === "present"
    ).length;

    const attendancePercentage =
      totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    res.json({
      attendanceList: attendance,
      attendancePercentage,
      totalClasses,
      presentClasses,
    });
  } catch (err) {
    console.error("Detailed Attendance Error:", err);
    res.status(500).send("Server Error");
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user.id }).sort({
      date: -1,
    });
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure directory exists
    const dir = 'uploads/homework';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `homework-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".pdf") {
      return cb(new Error("Only PDFs are allowed"), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});



exports.getHomework = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add .populate('teacher', 'name email') to populate teacher details
    const homework = await Homework.find({
      studentClass: user.class,
    })
    .populate('teacher', 'name email _id')  // Add this line
    .sort({ createdAt: -1 });

    res.json(homework);
  } catch (err) {
    console.error("Detailed Error:", err);
    res.status(500).send("Server Error");
  }
};





exports.downloadHomework = async (req, res) => {
  try {
    const { homeworkId } = req.params;
    const user = req.user; // Get user from auth middleware

    // Find the homework assignment
    const homework = await Homework.findById(homeworkId);

    if (!homework) {
      return res.status(404).json({
        message: "Homework not found"
      });
    }

    

    // Normalize the path
    const normalizedPath = homework.homeworkPdf.replace(/\\/g, '/');
    const filePath = path.join(process.cwd(), normalizedPath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "PDF file not found on server"
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="homework-${homework.title}.pdf"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error('File Stream Error:', error);
      res.status(500).json({ message: "Error streaming file" });
    });

    fileStream.pipe(res);
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({ message: "Error downloading file" });
  }
};





// Get specific homework details for a student
exports.getHomeworkDetails = async (req, res) => {
  try {
    const { homeworkId } = req.params;

    const user = await User.findById(req.user.id);

    // Find the homework and ensure it's for the student's class
    const homework = await Homework.findOne({
      _id: homeworkId,
      studentClass: user.class,
    }).populate("teacher", "name email");

    if (!homework) {
      return res
        .status(404)
        .json({ message: "Homework not found or not assigned to your class" });
    }

    // Check if student has already submitted
    const studentSubmission = homework.submissions.find(
      (submission) => submission.student.toString() === req.user.id
    );

    res.json({
      ...homework.toObject(),
      hasSubmitted: !!studentSubmission,
      submission: studentSubmission || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Submit homework with PDF
// exports.submitHomework = async (req, res) => {
//   // Use upload.single middleware directly in the route handler
//   upload.single("homeworkPdf")(req, res, async (uploadErr) => {
//     // First, handle any multer upload errors
//     if (uploadErr) {
//       return res.status(400).json({ 
//         message: "File upload error", 
//         error: uploadErr.message 
//       });
//     }

//     try {
//       // Extract homework ID from request params
//       const { homeworkId } = req.params;

//       // Detailed logging for debugging
//       console.log("User ID from Token:", req.user.id);
//       console.log("Received Homework ID:", homeworkId);
//       console.log("Uploaded File:", req.file);

//       // Validate homework ID
//       if (!mongoose.Types.ObjectId.isValid(homeworkId)) {
//         return res.status(400).json({
//           message: "Invalid homework ID",
//           details: `Received ID: ${homeworkId}`
//         });
//       }

//       // Find the homework
//       const homework = await Homework.findById(homeworkId);
//       if (!homework) {
//         return res.status(404).json({ 
//           message: "Homework not found",
//           details: `No homework found with ID: ${homeworkId}`
//         });
//       }

//       // Verify the homework is for the student's class
//       const user = await User.findById(req.user.id);
//       if (homework.studentClass !== user.class) {
//         return res.status(403).json({ 
//           message: "Homework not assigned to your class" 
//         });
//       }

//       // Check due date
//       if (new Date() > homework.dueDate) {
//         return res.status(400).json({ 
//           message: "Homework submission is past due date" 
//         });
//       }

//       // Validate file upload
//       if (!req.file) {
//         return res.status(400).json({ 
//           message: "PDF file is required" 
//         });
//       }

//       // Remove previous submission if exists
//       homework.submissions = homework.submissions.filter(
//         (submission) => submission.student.toString() !== req.user.id
//       );

//       // Add new submission
//       homework.submissions.push({
//         student: req.user.id,
//         // pdfUrl: req.file.path,
//         pdfUrl: req.file.path.replace(/\\/g, '/'),
//         submittedAt: new Date()
//       });

//       // Save the updated homework
//       await homework.save();

//       res.json({
//         message: "Homework submitted successfully",
//         submission: {
//           pdfUrl: req.file.path,
//           submittedAt: new Date()
//         }
//       });

//     } catch (err) {
//       console.error("Homework Submission Error:", err);
//       res.status(500).json({ 
//         message: "Server Error", 
//         error: err.message 
//       });
//     }
//   });
// };


exports.submitHomework = async (req, res) => {
  // Use upload.single middleware directly in the route handler
  upload.single("homeworkPdf")(req, res, async (uploadErr) => {
    // First, handle any multer upload errors
    if (uploadErr) {
      return res.status(400).json({ 
        message: "File upload error", 
        error: uploadErr.message 
      });
    }

    try {
      // Extract homework ID from request params
      const { homeworkId } = req.params;

      // Detailed logging for debugging
      console.log("User ID from Token:", req.user.id);
      console.log("Received Homework ID:", homeworkId);
      console.log("Uploaded File:", req.file);

      // Validate homework ID
      if (!mongoose.Types.ObjectId.isValid(homeworkId)) {
        return res.status(400).json({
          message: "Invalid homework ID",
          details: `Received ID: ${homeworkId}`
        });
      }

      // Find the homework
      const homework = await Homework.findById(homeworkId);
      if (!homework) {
        return res.status(404).json({ 
          message: "Homework not found",
          details: `No homework found with ID: ${homeworkId}`
        });
      }

      // Verify the homework is for the student's class
      const user = await User.findById(req.user.id);
      if (homework.studentClass !== user.class) {
        return res.status(403).json({ 
          message: "Homework not assigned to your class" 
        });
      }

      // Check if student has already submitted
      const existingSubmission = homework.submissions.find(
        (submission) => submission.student.toString() === req.user.id
      );

      if (existingSubmission) {
        // If there's already a submission, delete the uploaded file and return error
        if (req.file) {
          await fs.unlink(req.file.path);
        }
        return res.status(400).json({
          message: "You have already submitted this homework. Multiple submissions are not allowed.",
          submittedAt: existingSubmission.submittedAt
        });
      }

      // Check due date
      if (new Date() > homework.dueDate) {
        // Clean up uploaded file if exists
        if (req.file) {
          await fs.unlink(req.file.path);
        }
        return res.status(400).json({ 
          message: "Homework submission is past due date" 
        });
      }

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ 
          message: "PDF file is required" 
        });
      }

      // Add new submission
      homework.submissions.push({
        student: req.user.id,
        pdfUrl: req.file.path.replace(/\\/g, '/'),
        submittedAt: new Date()
      });

      // Save the updated homework
      await homework.save();

      res.json({
        message: "Homework submitted successfully! You cannot submit again.",
        submission: {
          pdfUrl: req.file.path.replace(/\\/g, '/'),
          submittedAt: new Date()
        }
      });

    } catch (err) {
      // Clean up uploaded file if exists in case of error
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      console.error("Homework Submission Error:", err);
      res.status(500).json({ 
        message: "Server Error", 
        error: err.message 
      });
    }
  });
};


// Issue Library Book
const mongoose = require("mongoose");

exports.issueBook = async (req, res) => {
  try {
    const { bookId } = req.body;

    // Validate bookId
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await Library.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.isIssued) {
      return res.status(400).json({ message: "Book is already issued" });
    }

    book.isIssued = true;
    book.issuedTo = req.user.id;
    book.issuedDate = new Date();

    await book.save();

    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};




exports.getSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.find()
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name');
    res.json(syllabus);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};



exports.downloadSyllabus = async (req, res) => {
  try {
    console.log('Download request for ID:', req.params.id);

    const syllabus = await Syllabus.findById(req.params.id.trim());

    if (!syllabus) {
      console.log('Syllabus not found in database');
      return res.status(404).json({ msg: 'Syllabus not found' });
    }

    // Normalize and resolve the path
    const normalizedPath = path.normalize(syllabus.pdfFile.path);
    const windowsPath = normalizedPath.replace(/\//g, '\\');
    const file = path.resolve(process.cwd(), windowsPath);

    console.log('Database path:', syllabus.pdfFile.path);
    console.log('Normalized path:', normalizedPath);
    console.log('Windows path:', windowsPath);
    console.log('Full file path:', file);
    console.log('Current directory:', process.cwd());
    console.log('File exists:', fs.existsSync(file));

    if (!fs.existsSync(file)) {
      console.error('File not found at path:', file);
      return res.status(404).json({ msg: 'File not found on server' });
    }

    res.download(file, syllabus.pdfFile.originalname, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          return res.status(500).json({ msg: 'Error downloading file', error: err.message });
        }
      }
    });

  } catch (err) {
    console.error('Server error:', err);
    if (!res.headersSent) {
      res.status(500).json({ msg: 'Server Error', error: err.message });
    }
  }
};





// Get Student Remarks
exports.getRemarks = async (req, res) => {
  try {
    const remarks = await Remarks.find({ student: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(remarks);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Get Study Material
exports.getStudyMaterial = async (req, res) => {
  try {
    const studyMaterial = await StudyMaterial.find().sort({ createdAt: -1 });
    res.json(studyMaterial);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};


// Return Library Book
exports.returnBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Library.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.issuedTo.toString() !== req.user.id) {
      return res.status(400).json({ message: "You did not issue this book" });
    }

    book.isIssued = false;
    book.issuedTo = null;
    book.issuedDate = null;

    await book.save();

    res.json({ message: "Book returned successfully", book });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Update Homework Status
exports.updateHomeworkStatus = async (req, res) => {
  try {
    const { homeworkId, status } = req.body;

    const homework = await Homework.findById(homeworkId);

    if (!homework) {
      return res.status(404).json({ message: "Homework not found" });
    }

    homework.status = status;
    await homework.save();

    res.json({ message: "Homework status updated", homework });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Get Online Test Results
exports.getOnlineTestResults = async (req, res) => {
  try {
    const onlineTestResults = await OnlineTest.find({
      student: req.user.id,
    }).sort({ testDate: -1 });
    res.json(onlineTestResults);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.submitOnlineTest = async (req, res) => {
  try {
    const { testId, responses } = req.body;

    // Find the online test
    const test = await OnlineTest.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Prepare student's responses
    const studentResponses = responses.map((response) => ({
      questionId: response.questionId,
      selectedOption: response.selectedOption,
    }));

    // Check if student has already submitted responses
    const existingResponseIndex = test.studentResponses.findIndex(
      (resp) => resp.student.toString() === req.user.id
    );

    // Check test duration
    const currentTime = new Date();
    if (existingResponseIndex > -1) {
      const existingResponse = test.studentResponses[existingResponseIndex];

      // Check if test is already submitted
      if (existingResponse.submitted) {
        return res.status(400).json({ message: "Test already submitted" });
      }

      // Check if time has exceeded
      const testStartTime = existingResponse.startTime;
      const timeDiff = (currentTime - testStartTime) / (1000 * 60); // minutes

      if (timeDiff > test.duration) {
        existingResponse.submitted = true;
        await test.save();
        return res.status(400).json({ message: "Test time exceeded" });
      }

      // Update existing response
      existingResponse.answers = studentResponses;
      existingResponse.submitted = true;
    } else {
      // Add new response
      test.studentResponses.push({
        student: req.user.id,
        answers: studentResponses,
        score: 0,
        evaluated: false,
        startTime: currentTime,
        submitted: true,
      });
    }

    await test.save();

    res.json({
      message: "Test submitted successfully",
      testId: test._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.getAvailableOnlineTests = async (req, res) => {
  try {
    const tests = await OnlineTest.find()
      .select("-questions.options.isCorrect") // Exclude correct answers
      .sort({ createdAt: -1 });

    // Check if student has already started the test
    const testsWithStartStatus = tests.map((test) => {
      const studentResponse = test.studentResponses.find(
        (resp) => resp.student.toString() === req.user.id
      );

      return {
        ...test.toObject(),
        hasStarted: !!studentResponse,
        isSubmitted: studentResponse?.submitted || false,
      };
    });

    res.json(testsWithStartStatus);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Add a method for students to view their test results
exports.getStudentTestResults = async (req, res) => {
  try {
    const tests = await OnlineTest.find({
      "studentResponses.student": req.user.id,
    }).select("-questions.options.isCorrect");

    // Filter to only include tests where the student has a response
    const studentTests = tests.filter((test) =>
      test.studentResponses.some(
        (resp) => resp.student.toString() === req.user.id && resp.evaluated
      )
    );

    res.json(studentTests);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};



exports.getTransportDetails = async (req, res) => {
  try {
    const busRoutes = await Transport.find();

    // Add detailed logging
    console.log("Raw Bus Routes:", busRoutes);

    const mappedRoutes = busRoutes.map((route) => {
      console.log("Individual Route:", route);
      console.log("Driver Object:", route.driver);

      return {
        busNumber: route.busNumber,
        routeNumber: route.routeNumber,
        startLocation: route.startLocation,
        endLocation: route.endLocation,
        departureTime: route.departureTime,
        arrivalTime: route.arrivalTime,
        driverName:
          route.driver && route.driver.name
            ? route.driver.name
            : "Unknown Driver",
        driverContact:
          route.driver && route.driver.contact ? route.driver.contact : "N/A",
        capacity: route.capacity,
        currentPassengers: route.currentPassengers,
      };
    });

    console.log("Mapped Routes:", mappedRoutes);

    res.json(mappedRoutes);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// In studentController.js
const User = require("../models/User");

exports.getStudentProfile = async (req, res) => {
  try {
    // Find the user by ID and exclude sensitive information like password
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the user is not a student, deny access
    if (user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Prepare the profile response
    const profileResponse = {
      name: user.name,
      email: user.email,
      Profession: user.role,
    };

    res.json(profileResponse);
  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.status(500).send("Server Error");
  }
};




exports.getStudentFeeDetailsForPeriod = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;

    // Find fee record for the authenticated student and specified period
    const feeRecord = await Fees.findOne({
      student: req.user.id,
      academicYear,
      semester
    });

    if (!feeRecord) {
      return res.status(404).json({ message: "No fee record found for the specified period" });
    }

    // Prepare detailed fee summary
    const feeSummary = {
      academicYear: feeRecord.academicYear,
      semester: feeRecord.semester,
      feeStructure: feeRecord.feeStructure,
      totalFeeAmount: feeRecord.totalFeeAmount,
      remainingBalance: feeRecord.remainingBalance,
      paymentStatus: feeRecord.paymentStatus,
      dueDate: feeRecord.dueDate,
      discounts: feeRecord.discounts,
      paymentDetails: feeRecord.paymentDetails,
    };

    res.json(feeSummary);
  } catch (err) {
    console.error("Error fetching student fee details:", err);
    res.status(500).send("Server Error");
  }
};

// Existing method remains the same
exports.getStudentFeeDetails = async (req, res) => {
  try {
    const feeRecords = await Fees.find({
      student: req.user.id,
    }).sort({ createdAt: -1 });

    if (!feeRecords || feeRecords.length === 0) {
      return res.status(404).json({ message: "No fee records found" });
    }

    const feeSummary = feeRecords.map((record) => ({
      academicYear: record.academicYear,
      semester: record.semester,
      feeStructure: record.feeStructure,
      totalFeeAmount: record.totalFeeAmount,
      remainingBalance: record.remainingBalance,
      paymentStatus: record.paymentStatus,
      dueDate: record.dueDate,
      discounts: record.discounts,
      paymentDetails: record.paymentDetails,
    }));

    res.json(feeSummary);
  } catch (err) {
    console.error("Error fetching student fee details:", err);
    res.status(500).send("Server Error");
  }
};


exports.getAvailableBooks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const books = await Library.find({
      class: user.class,
      availableCopies: { $gt: 0 },
    });

    // Add issue status for each book
    const booksWithStatus = books.map((book) => {
      const existingIssue = book.issuedBooks.find(
        (issue) => issue.student.toString() === req.user.id
      );

      return {
        ...book.toObject(),
        issueStatus: existingIssue ? existingIssue.status : null,
      };
    });

    res.json(booksWithStatus);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};


exports.requestBookIssue = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Library.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if user has already requested or issued this book
    const existingIssue = book.issuedBooks.find(
      (issue) => issue.student.toString() === req.user.id
    );

    if (existingIssue) {
      return res
        .status(400)
        .json({ message: "Book already requested or issued" });
    }

    // Add book issue request
    book.issuedBooks.push({
      student: req.user.id,
      status: "pending",
    });

    await book.save();

    res.json({ message: "Book issue requested", book });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};



// for sports



// Get sports events for student
exports.getStudentSportsEvents = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('User ID from Token:', req.user.id);
    console.log('Student Class:', student.class);

    // Query to fetch only eligible upcoming sports events
    const events = await SportsEvent.find({
      eventDate: { $gte: new Date() }, // Only upcoming events
      eligibleClasses: student.class // Only events where student's class is in eligibleClasses array
    })
      .populate('coach', 'name email')
      .sort({ eventDate: 1 });

    console.log('Matched Events:', events);

    const eventsWithStatus = events.map((event) => {
      const isRegistered = event.registeredStudents.some(
        (registration) => registration.student.toString() === req.user.id
      );

      return {
        ...event.toObject(),
        isRegistered,
        canRegister: event.maxParticipants > event.registeredStudents.length,
        isEligible: true // Since we're already filtering by eligibleClasses, these events are all eligible
      };
    });

    res.json(eventsWithStatus);
  } catch (err) {
    console.error('Error fetching student sports events:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Register for sports event
exports.registerForSportsEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if eventId is valid
    if (!eventId || !eventId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    // Find the student
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the event by ID
    const event = await SportsEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Sports event not found' });
    }

    // Check if student's class is eligible
    if (!event.eligibleClasses.includes(student.class)) {
      return res.status(403).json({ 
        message: 'Not eligible for this event',
        studentClass: student.class,
        eligibleClasses: event.eligibleClasses
      });
    }

    // Check if the registration deadline has passed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({
        message: 'Registration deadline has passed',
        registrationDeadline: event.registrationDeadline,
      });
    }

    // Check if maximum participants have been reached
    if (event.maxParticipants && event.registeredStudents.length >= event.maxParticipants) {
      return res.status(400).json({
        message: 'Event has reached maximum participants',
        maxParticipants: event.maxParticipants,
        currentParticipants: event.registeredStudents.length
      });
    }

    // Check if the student is already registered
    const alreadyRegistered = event.registeredStudents.some(
      (registration) => registration.student.toString() === req.user.id
    );
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Add the student to the registeredStudents list
    event.registeredStudents.push({
      student: req.user.id,
      registrationDate: new Date(),
    });

    // Save the updated event
    await event.save();

    res.json({ 
      message: 'Successfully registered for event', 
      event,
      studentClass: student.class
    });
  } catch (err) {
    console.error('Error registering for sports event:', err);

    // Check for validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', error: err.message });
    }

    // Handle other errors
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};