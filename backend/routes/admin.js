const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const adminController = require('../controllers/adminController');

// Library Routes
router.post('/library/add-book', 
  [auth, roleAuth(['admin'])], 
  adminController.addBook
);

// Syllabus Routes
router.post('/syllabus/add', 
  [auth, roleAuth(['admin'])], 
  adminController.addSyllabus
);

// Study Material Routes
router.post('/study-material/add', 
  [auth, roleAuth(['admin'])], 
  adminController.addStudyMaterial
);

// User Management Routes
router.get('/users', 
  [auth, roleAuth(['admin'])], 
  adminController.getAllUsers
);

router.post('/users', 
  [auth, roleAuth(['admin'])], 
  adminController.createUser
);

router.put('/users/:userId', 
  [auth, roleAuth(['admin'])], 
  adminController.updateUser
);

router.delete('/users/:userId', 
  [auth, roleAuth(['admin'])], 
  adminController.deleteUser
);

module.exports = router;