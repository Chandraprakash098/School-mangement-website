// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');
// const roleAuth = require('../middleware/roleAuth');
// const accountController = require('../controllers/accountController');

// router.post('/create', 
//   [auth, roleAuth(['admin','account'])], 
//   accountController.createEmployeeAccount
// );

// router.get('/:userId', 
//   [auth, roleAuth(['admin','account'])], 
//   accountController.getEmployeeAccount
// );

// router.put('/:userId', 
//   [auth, roleAuth(['admin','account'])], 
//   accountController.updateEmployeeAccount
// );

// router.get('/', 
//   [auth, roleAuth(['admin','account'])], 
//   accountController.getAllEmployeeAccounts
// );

// router.post('/:userId/documents', 
//   [auth, roleAuth(['admin','account'])], 
//   accountController.uploadDocuments
// );

// module.exports = router;



const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const feesController = require('../controllers/accountController');


// Get students by class
router.get('/students/:className', 
  [auth, roleAuth(['admin', 'account'])], 
  feesController.getStudentsByClass
);

router.get('/available-classes', 
  [auth, roleAuth(['admin', 'account'])], 
  feesController.getAvailableClasses
);

// Create fee record for specific student
router.post('/create-fee-record', 
  [auth, roleAuth(['admin', 'account'])], 
  feesController.createFeeRecordForStudent
);

// Get fee details for specific student and period
router.get('/student-fee-details/:studentId', 
  [auth, roleAuth(['admin', 'account', 'student'])], 
  feesController.getFeeDetailsForStudentPeriod
);

// Create new fee record
router.post('/create', 
  [auth, roleAuth(['admin', 'account'])], 
  feesController.createFeeRecord
);

// Process fee payment
router.post('/:feeId/payment', 
  [auth, roleAuth(['admin', 'account'])], 
  feesController.processFeePayment
);

// Get student fee records
router.get('/student/:studentId', 
  [auth, roleAuth(['admin', 'account', 'student'])], 
  feesController.getStudentFeeRecords
);

// Generate fee report
router.get('/report', 
  [auth, roleAuth(['admin', 'account'])], 
  feesController.generateFeeReport
);

// Update fee record
router.put('/:feeId', 
  [auth, roleAuth(['admin', 'account'])], 
  feesController.updateFeeRecord
);

// Delete fee record
router.delete('/:feeId', 
  [auth, roleAuth(['admin', 'account'])], 
  feesController.deleteFeeRecord
);

module.exports = router;