// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUsers, updateProfile, updateStatus, getOnlineUsers } = require('../controllers/userController');

router.use(protect);

router.get('/', getUsers);
router.put('/profile', updateProfile);
router.put('/status', updateStatus);
router.get('/online', getOnlineUsers);

module.exports = router;
