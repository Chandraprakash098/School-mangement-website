const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const teacherController = require('../controllers/teacherController');

// router.post('/attendance', 
//   [auth, roleAuth(['teacher'])], 
//   teacherController.assignAttendance
// );

// Teacher Routes
// router.get('/students-for-attendance', 
//   [auth, roleAuth(['teacher'])], 
//   teacherController.getStudentsForAttendance
// );

// router.post('/attendance', 
//   [auth, roleAuth(['teacher'])], 
//   teacherController.assignAttendance
// );


// Get students for attendance
router.get('/students-for-attendance', 
  [auth, roleAuth(['teacher'])], 
  teacherController.getStudentsForAttendance
);

// Check if attendance exists
router.get('/check-attendance',
  [auth, roleAuth(['teacher'])],
  teacherController.checkAttendanceExists
);

// Assign attendance
router.post('/attendance', 
  [auth, roleAuth(['teacher'])], 
  teacherController.assignAttendance
);

// Get teacher's attendance history
router.get('/attendance-history',
  [auth, roleAuth(['teacher'])],
  teacherController.getTeacherAttendanceHistory
);

router.post('/homework', 
  [auth, roleAuth(['teacher'])], 
  teacherController.createHomework
);

router.get('/homework/get', 
  [auth, roleAuth(['teacher'])], 
  teacherController.getTeacherHomework
);

router.get('/homework/:homeworkId/submissions', 
  [auth, roleAuth(['teacher'])], 
  teacherController.getHomeworkSubmissions
);

router.post('/homework/:homeworkId/submissions/:submissionId/grade', 
  [auth, roleAuth(['teacher'])], 
  teacherController.gradeHomeworkSubmission
);

router.get('/homework/:homeworkId/submissions/:submissionId/download', 
  [auth, roleAuth(['teacher'])], 
  teacherController.downloadHomeworkSubmission
);

router.post('/remarks', 
  [auth, roleAuth(['teacher'])], 
  teacherController.createRemarks
);

router.post('/online-test', 
  [auth, roleAuth(['teacher'])], 
  teacherController.createOnlineTest
);

router.post('/evaluate-test', 
  [auth, roleAuth(['teacher'])], 
  teacherController.evaluateOnlineTest
);

// In teacher routes
router.get('/unevaluated-tests', 
  [auth, roleAuth(['teacher'])], 
  teacherController.getUnevaluatedTests
);

module.exports = router;
