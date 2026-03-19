// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  accessChat, getChats, createGroupChat, updateGroupChat,
  addToGroup, removeFromGroup, togglePinMessage,
} = require('../controllers/chatController');

router.use(protect);

router.route('/').post(accessChat).get(getChats);
router.post('/group', createGroupChat);
router.put('/group/:chatId', updateGroupChat);
router.put('/group/:chatId/add', addToGroup);
router.put('/group/:chatId/remove', removeFromGroup);
router.put('/:chatId/pin/:messageId', togglePinMessage);

module.exports = router;
