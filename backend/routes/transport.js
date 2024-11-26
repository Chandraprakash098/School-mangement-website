const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const transportController = require('../controllers/transportController');

router.post('/bus-route', 
  [auth, roleAuth(['admin', 'transport'])], 
  transportController.createBusRoute
);
router.get('/bus-route', 
    [auth, roleAuth(['admin', 'transport', 'student'])], 
    transportController.getAllBusRoutes
  );
  
  router.get('/bus-route/:routeId', 
    [auth, roleAuth(['admin', 'transport', 'student'])], 
    transportController.getBusRoute
  );
  
  router.put('/bus-route/:routeId', 
    [auth, roleAuth(['admin', 'transport'])], 
    transportController.updateBusRoute
  );
  
  router.delete('/bus-route/:routeId', 
    [auth, roleAuth(['admin', 'transport'])], 
    transportController.deleteBusRoute
  );
  
  module.exports = router;