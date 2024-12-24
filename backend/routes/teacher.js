const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const teacherController = require('../controllers/teacherController');
const { check } = require('express-validator');




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

// router.get(
//   '/students/:classLevel',
//   [auth, roleAuth(['teacher'])],
//   teacherController.getStudentsByClass
// );

// router.get('/students/:classLevel', auth, roleAuth(['teacher']), async (req, res) => {
//   try {
//       const students = await User.find({ 
//           role: 'student', 
//           class: req.params.classLevel 
//       }).select('_id name');
//       res.json(students);
//   } catch (err) {
//       res.status(500).json({ message: err.message });
//   }
// });

router.get('/students/:classLevel', auth, roleAuth(['teacher']), async (req, res) => { 
  try { 
      console.log('Requested class level:', req.params.classLevel);
      const students = await User.find({  
          role: 'student',  
          class: req.params.classLevel  
      }).select('_id name'); 
      console.log('Found students:', students);
      res.json(students); 
  } catch (err) { 
      console.error('Error fetching students:', err);
      res.status(500).json({ message: err.message }); 
  } 
});

router.post(
  '/remarks',
  [
    auth,
    roleAuth(['teacher']),
    [
      check('subject', 'Subject is required').notEmpty(),
      check('classLevel', 'Class level is required').notEmpty(),
      check('students', 'Students data is required').isArray()
    ]
  ],
  teacherController.createRemarks
);

// router.post('/remarks', 
//   [auth, roleAuth(['teacher'])], 
//   teacherController.createRemarks
// );

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
