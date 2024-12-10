// routes/librarianRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const librarianController = require('../controllers/librarianController');

router.post('/add-book', 
  [auth, roleAuth(['librarian', 'admin'])], 
  librarianController.addBook
);

router.get('/pending-requests', 
  [auth, roleAuth(['librarian'])], 
  librarianController.getPendingBookRequests
);

router.post('/approve-book-issue', 
  [auth, roleAuth(['librarian'])], 
  librarianController.approveBookIssue
);

router.post('/return-book', 
  [auth, roleAuth(['librarian'])], 
  librarianController.returnBook
);

module.exports = router;