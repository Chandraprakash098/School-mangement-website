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
const multer = require("multer");
const path = require("path");
const fs= require('fs')


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

// exports.getAttendance = async (req, res) => {
//   try {
//     console.log('Authenticated User Id:', req.user.id);
//     console.log('Attendance Request User ID Type:', typeof req.user.id);

//     const attendance = await Attendance.find({ student: req.user.id })
//       .sort({ date: -1 });

//       console.log('Found Attendance:', attendance);

//     // Calculate attendance percentage
//     const totalAttendance = attendance.length;
//     const presentDays = attendance.filter(a => a.status === 'present').length;
//     const attendancePercentage = totalAttendance > 0
//       ? Math.round((presentDays / totalAttendance) * 100)
//       : 0;

//     res.json({
//       attendanceList: attendance,
//       attendancePercentage: attendancePercentage
//     });
//   } catch (err) {
//     console.error('Detailed Error:', err);
//     res.status(500).send('Server Error');
//   }
// };

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

// Configure multer for PDF upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/homework/"); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `homework-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`
    );
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

// Get Homework
// exports.getHomework = async (req, res) => {
//   try {
//     console.log('Authenticated User Id:', req.user.id);
//     console.log('Attendance Request User ID Type:', typeof req.user.id);

//     const homework = await Homework.find()
//       .sort({ createdAt: -1 });
//     res.json(homework);
//   } catch (err) {
//     console.error('Detailed Error:', err);
//     res.status(500).send('Server Error');
//   }
// };

// exports.getHomework = async (req, res) => {
//   try {
//     // Find the logged-in user to get their class
//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Find homework specific to student's class
//     const homework = await Homework.find({
//       studentClass: user.class,
//     }).sort({ createdAt: -1 });

//     res.json(homework);
//   } catch (err) {
//     console.error("Detailed Error:", err);
//     res.status(500).send("Server Error");
//   }
// };


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


// exports.downloadHomework = async (req, res) => {
//   try {
//     const { homeworkId } = req.params;
//     const user = await User.findById(req.user.id);

//     const homework = await Homework.findOne({
//       _id: homeworkId,
//       studentClass: user.class
//     });

//     if (!homework) {
//       return res.status(404).json({ 
//         message: "Homework not found or not assigned to your class" 
//       });
//     }

//     res.download(homework.homeworkPdf);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };


// exports.downloadHomework = async (req, res) => {
//   try {
//     const { homeworkId } = req.params;
//     const user = await User.findById(req.user.id);
    
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const homework = await Homework.findOne({
//       _id: homeworkId,
//       studentClass: user.class
//     });

//     if (!homework) {
//       return res.status(404).json({ 
//         message: "Homework not found or not assigned to your class" 
//       });
//     }

//     // Get the full path to the PDF file
//     const filePath = path.join(__dirname, '..', homework.homeworkPdf);
    
//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ 
//         message: "PDF file not found" 
//       });
//     }

//     // Set the appropriate headers
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=homework-${homeworkId}.pdf`);

//     // Stream the file
//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);

//   } catch (err) {
//     console.error("Download Error:", err);
//     res.status(500).json({ 
//       message: "Error downloading homework",
//       error: err.message 
//     });
//   }
// };


exports.downloadHomework = async (req, res) => {
  try {
    const { homeworkId } = req.params;

    // Get current user's details
    const user = await User.findById(req.user.id);

    // Find homework assigned to the student's class
    const homework = await Homework.findOne({
      _id: homeworkId,
      studentClass: user.class,
    });

    if (!homework) {
      return res.status(404).json({
        message: "Homework not found or not assigned to your class",
      });
    }

    // Convert relative path to absolute path
    const filePath = path.resolve(__dirname, "../", homework.homeworkPdf);

    // Send the file to the client
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error while downloading file:", err);
        return res.status(500).send("File not found or server error");
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
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

      // Check due date
      if (new Date() > homework.dueDate) {
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

      // Remove previous submission if exists
      homework.submissions = homework.submissions.filter(
        (submission) => submission.student.toString() !== req.user.id
      );

      // Add new submission
      homework.submissions.push({
        student: req.user.id,
        pdfUrl: req.file.path,
        submittedAt: new Date()
      });

      // Save the updated homework
      await homework.save();

      res.json({
        message: "Homework submitted successfully",
        submission: {
          pdfUrl: req.file.path,
          submittedAt: new Date()
        }
      });

    } catch (err) {
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

// Get Syllabus
exports.getSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.find().sort({ createdAt: -1 });
    res.json(syllabus);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
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

// // Get Transport Details
// exports.getTransportDetails = async (req, res) => {
//   try {
//     const transportDetails = await Transport.find({ student: req.user.id });
//     res.json(transportDetails);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };

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

// exports.getTransportDetails = async (req, res) => {
//   try {
//     // Fetch available bus routes
//     const busRoutes = await Transport.find({
//       // You can add additional filtering if needed
//     }).select('busNumber routeNumber startLocation endLocation departureTime arrivalTime capacity currentPassengers');

//     res.json(busRoutes);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };

// exports.getTransportDetails = async (req, res) => {
//   try {
//     const busRoutes = await Transport.find().lean().transform(route => ({
//       ...route,
//       driverName: route.driver.name,
//       driverContact: route.driver.contact
//     }));
//     res.json(busRoutes);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };

// exports.getTransportDetails = async (req, res) => {
//   try {
//     const busRoutes = await Transport.find();
//     const mappedRoutes = busRoutes.map(route => ({
//       busNumber: route.busNumber,
//       routeNumber: route.routeNumber,
//       startLocation: route.startLocation,
//       endLocation: route.endLocation,
//       departureTime: route.departureTime,
//       arrivalTime: route.arrivalTime,
//       driverName: route.driver?.name || "Unknown Driver",  // Use optional chaining
//       driverContact: route.driver?.contact || "N/A",  // Use optional chaining
//       capacity: route.capacity,
//       currentPassengers: route.currentPassengers
//     }));
//     res.json(mappedRoutes);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };

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

// // Get Student Fee Details
// exports.getStudentFeeDetails = async (req, res) => {
//   try {
//     // Find fee records for the authenticated student
//     const feeRecords = await Fees.find({
//       student: req.user.id,
//     }).sort({ createdAt: -1 });

//     if (!feeRecords || feeRecords.length === 0) {
//       return res.status(404).json({ message: "No fee records found" });
//     }

//     // Prepare a detailed fee summary
//     const feeSummary = feeRecords.map((record) => ({
//       academicYear: record.academicYear,
//       semester: record.semester,
//       feeStructure: record.feeStructure,
//       totalFeeAmount: record.totalFeeAmount,
//       remainingBalance: record.remainingBalance,
//       paymentStatus: record.paymentStatus,
//       dueDate: record.dueDate,
//       discounts: record.discounts,
//       paymentDetails: record.paymentDetails,
//     }));

//     res.json(feeSummary);
//   } catch (err) {
//     console.error("Error fetching student fee details:", err);
//     res.status(500).send("Server Error");
//   }
// };


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

// exports.getAvailableBooks = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Convert student's class to match library's class format
//     const studentClass = user.class === '10th' ? 'Class 10' : user.class;

//     const books = await Library.find({
//       class: studentClass,  // Use the converted class name
//       availableCopies: { $gt: 0 }
//     });

//     // Add logging to debug
//     console.log('User Class:', user.class);
//     console.log('Converted Class:', studentClass);
//     console.log('Found Books:', books);

//     // Add issue status for each book
//     const booksWithStatus = books.map(book => {
//       const existingIssue = book.issuedBooks.find(
//         issue => issue.student.toString() === req.user.id
//       );

//       return {
//         ...book.toObject(),
//         issueStatus: existingIssue ? existingIssue.status : null
//       };
//     });

//     res.json(booksWithStatus);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };

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