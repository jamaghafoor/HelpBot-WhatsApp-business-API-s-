import express from 'express';
import {
  getAllUsers,
  getUserByIdentifier,
  getUserMessages,
  markAsRead,
} from '../controllers/userController.js';

const router = express.Router();

// GET /api/users — Fetch all users (chat list)
router.get('/', getAllUsers);

// GET /api/users/:identifier — Fetch user by user_id or phone
router.get('/:identifier', getUserByIdentifier);

// GET /api/users/:identifier/messages — Fetch messages for a user
router.get('/:identifier/messages', getUserMessages);

// PATCH /api/users/:identifier/read — Mark messages as read
router.patch('/:identifier/read', markAsRead);

export default router;
