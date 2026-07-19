import { Router } from 'express';
import { sendMessage, getChatHistory, clearChat, deleteMessage } from '../controllers/chatController';
import { protect } from '../middlewares/auth';

const router = Router();

// Get history + Send message
router.route('/:projectId')
  .get(protect, getChatHistory)
  .post(protect, sendMessage);

// Clear all messages
router.delete('/:projectId/clear', protect, clearChat);

// Delete a specific message
router.delete('/:projectId/message/:messageId', protect, deleteMessage);

export default router;
