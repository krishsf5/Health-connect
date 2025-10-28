const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const {
  listNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');

router.use(authRequired);

router.get('/', listNotifications);
router.patch('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);

module.exports = router;
