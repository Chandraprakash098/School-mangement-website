const Notification = require('../models/Notification');

exports.createNotification = async (recipients, title, message, type, relatedId) => {
  try {
    const notifications = recipients.map(recipientId => ({
      recipient: recipientId,
      title,
      message,
      type,
      relatedId
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.user.id,
      read: false 
    }).sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { type, relatedId } = req.params;
    
    await Notification.updateMany(
      {
        recipient: req.user.id,
        type,
        relatedId,
        read: false
      },
      { read: true }
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
};