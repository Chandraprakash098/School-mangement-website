// routes/notifications.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');

// Get all notifications for current user
router.get('/my', auth, getMyNotifications);

// Mark notification as read
router.post('/:type/:relatedId/read', auth, markAsRead);

module.exports = router;