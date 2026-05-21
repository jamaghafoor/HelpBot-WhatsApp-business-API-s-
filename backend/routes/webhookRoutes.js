import express from 'express';
import { handleIncomingMessage, handleStatusCallback } from '../controllers/webhookController.js';

const router = express.Router();

// Twilio sends form-urlencoded data for webhooks
router.use(express.urlencoded({ extended: false }));

// POST /api/webhook/incoming — Twilio hits this when a WhatsApp message arrives
router.post('/incoming', handleIncomingMessage);

// POST /api/webhook/status — Twilio hits this for delivery status updates
router.post('/status', handleStatusCallback);

export default router;
