import express from 'express';
import { sendMessage } from '../controllers/messageController.js';

const router = express.Router();

// POST /api/messages/send — Send a WhatsApp message via Twilio
router.post('/send', sendMessage);

export default router;
