const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const studentController = require('../controllers/studentController');
const transportController = require('../controllers/transportController')

router.get('/attendance/:userId', 
  [auth, roleAuth(['student'])], 
  studentController.getAttendance
);

router.get('/attendance/all', 
  [auth, roleAuth(['student'])], 
  studentController.getAllAttendance
);

router.get('/homework/:userId', 
  [auth, roleAuth(['student'])], 
  studentController.getHomework
);

router.get('/homework/:homeworkId', 
  [auth, roleAuth(['student'])], 
  studentController.getHomeworkDetails
);

router.post('/homework/:homeworkId/submit', 
  [auth, roleAuth(['student'])], 
  studentController.submitHomework
);

// router.post('/issue-book', 
//   [auth, roleAuth(['student'])], 
//   studentController.issueBook
// );

router.get('/syllabus', 
  [auth, roleAuth(['student'])], 
  studentController.getSyllabus
);

router.get('/remarks', 
  [auth, roleAuth(['student'])], 
  studentController.getRemarks
);

router.get('/study-material', 
  [auth, roleAuth(['student'])], 
  studentController.getStudyMaterial
);

// In student routes
router.get('/online-tests/:userId', 
  [auth, roleAuth(['student'])], 
  studentController.getAvailableOnlineTests
);

router.post('/submit-online-test', 
  [auth, roleAuth(['student'])], 
  studentController.submitOnlineTest
);

router.get('/test-results', 
  [auth, roleAuth(['student'])], 
  studentController.getStudentTestResults
);

// In studentRoutes.js, add:
router.get('/transport-routes', 
  [auth, roleAuth(['student'])], 
  transportController.getAllBusRoutes
);

router.get('/profile', 
  [auth, roleAuth(['student'])], 
  studentController.getStudentProfile
);


// Add this to the existing routes
router.get('/fee-details', 
  [auth, roleAuth(['student'])], 
  studentController.getStudentFeeDetails
);

router.get('/available-books', 
  [auth, roleAuth(['student'])], 
  studentController.getAvailableBooks
);

router.post('/request-book-issue', 
  [auth, roleAuth(['student'])], 
  studentController.requestBookIssue
);

module.exports = router;