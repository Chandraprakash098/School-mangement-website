const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const studentController = require('../controllers/studentController');

router.get('/attendance', 
  [auth, roleAuth(['student'])], 
  studentController.getAttendance
);

router.get('/homework', 
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

module.exports = router;
