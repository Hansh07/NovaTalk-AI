// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendMessage, getMessages, editMessage, deleteMessage,
  toggleReaction, searchMessages, replyInThread,
} = require('../controllers/messageController');

router.use(protect);

router.post('/', sendMessage);
router.get('/:chatId', getMessages);
router.put('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);
router.post('/:messageId/react', toggleReaction);
router.get('/:chatId/search', searchMessages);
router.post('/:messageId/thread', replyInThread);

module.exports = router;
