const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Get notifications
router.get('/', notificationController.getAllNotifications);
router.get('/today', notificationController.getTodayNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.get('/history', notificationController.getMedicationHistory);

// Update notifications
router.put('/:id/read', notificationController.markAsRead);
router.put('/:id/taken', notificationController.markAsTaken);
router.put('/:id/dismiss', notificationController.dismissNotification);
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;