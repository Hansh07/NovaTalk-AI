// routes/moderationRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboard, muteUser, unmuteUser, warnUser } = require('../controllers/moderationController');

router.use(protect);
router.use(authorize('admin', 'owner'));

router.get('/dashboard', getDashboard);
router.put('/mute/:userId', muteUser);
router.put('/unmute/:userId', unmuteUser);
router.put('/warn/:userId', warnUser);

module.exports = router;
