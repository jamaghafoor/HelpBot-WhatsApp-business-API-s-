import User from '../models/User.js';
import { sendWhatsAppMessage } from '../config/twilioClient.js';

/**
 * Send a WhatsApp message to a user
 * POST /api/messages/send
 * Body: { phone: "+923001234567", message: "Hello!" }
 */
export async function sendMessage(req, res) {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Both "phone" and "message" fields are required',
      });
    }

    // Send via Twilio
    const result = await sendWhatsAppMessage(phone, message);

    const now = new Date();

    // Build message entry for DB
    const messageEntry = {
      message_id: result.messageSid,
      body: message,
      direction: 'outbound',
      timestamp: now,
      status: result.status || 'sent',
    };

    // Generate user_id from phone
    const cleaned = phone.replace(/[^0-9]/g, '');
    const userId = `user_${cleaned}`;

    // Upsert: update if user exists, create if not
    const user = await User.findOneAndUpdate(
      { phone },
      {
        $push: { messages: messageEntry },
        $set: {
          last_message_at: now,
          is_active: true,
        },
        $setOnInsert: {
          user_id: userId,
          phone: phone,
          name: '',
          first_message_at: now,
          unread_count: 0,
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        messageSid: result.messageSid,
        status: result.status,
        to: phone,
        body: message,
        user_id: user.user_id,
        timestamp: now,
      },
    });
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
}
