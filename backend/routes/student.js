const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const studentController = require('../controllers/studentController');

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

router.post('/issue-book', 
  [auth, roleAuth(['student'])], 
  studentController.issueBook
);

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
router.get('/online-tests', 
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

module.exports = router;
