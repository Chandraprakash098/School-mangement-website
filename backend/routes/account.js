const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const accountController = require('../controllers/accountController');

router.post('/create', 
  [auth, roleAuth(['admin','account'])], 
  accountController.createEmployeeAccount
);

router.get('/:userId', 
  [auth, roleAuth(['admin','account'])], 
  accountController.getEmployeeAccount
);

router.put('/:userId', 
  [auth, roleAuth(['admin','account'])], 
  accountController.updateEmployeeAccount
);

router.get('/', 
  [auth, roleAuth(['admin','account'])], 
  accountController.getAllEmployeeAccounts
);

router.post('/:userId/documents', 
  [auth, roleAuth(['admin','account'])], 
  accountController.uploadDocuments
);

module.exports = router;
