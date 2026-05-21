import User from '../models/User.js';

/**
 * Generate a unique user_id from phone number
 */
function generateUserId(phone) {
  // Create a deterministic but readable user_id from phone
  const cleaned = phone.replace(/[^0-9]/g, '');
  return `user_${cleaned}`;
}

/**
 * Handle incoming WhatsApp webhook from Twilio
 * POST /api/webhook/incoming
 *
 * Twilio sends form-urlencoded data with fields like:
 * - From: "whatsapp:+923001234567"
 * - Body: "Hello!"
 * - MessageSid: "SM..."
 * - ProfileName: "John Doe"
 */
export async function handleIncomingMessage(req, res) {

  try {
    const {
      From,
      Body,
      MessageSid,
      ProfileName,
    } = req.body;

    if (!From || !Body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: From, Body',
      });
    }

    // Extract raw phone number (remove "whatsapp:" prefix)
    const phone = From.replace('whatsapp:', '');
    const userId = generateUserId(phone);
    const now = new Date();

    // Build the message object
    const messageEntry = {
      message_id: MessageSid || `msg_${Date.now()}`,
      body: Body,
      direction: 'inbound',
      timestamp: now,
      status: 'received',
    };

    // Try to find existing user, otherwise create new one
    let user = await User.findOne({ phone });

    if (user) {
      // User exists — update with new message
      user.messages.push(messageEntry);
      user.last_message_at = now;
      user.unread_count += 1;
      user.is_active = true;

      // Update name if we have ProfileName and user doesn't have one
      if (ProfileName && !user.name) {
        user.name = ProfileName;
      }

      await user.save();
      console.log(`📩 Message from existing user: ${phone} | "${Body}"`);
    } else {
      // New user — create entry
      user = await User.create({
        user_id: userId,
        phone: phone,
        name: ProfileName || '',
        first_message_at: now,
        last_message_at: now,
        messages: [messageEntry],
        unread_count: 1,
        is_active: true,
      });
      console.log(`🆕 New user created: ${phone} | user_id: ${userId}`);
    }

    // Respond with TwiML (empty response — no auto-reply from webhook)
    // If you want auto-replies, configure TWILLIO_REPLY_URL in Twilio console
    res.set('Content-Type', 'text/xml');
    res.status(200).send('<Response></Response>');
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error processing webhook',
      error: error.message,
    });
  }
}

/**
 * Handle Twilio status callback (message delivery updates)
 * POST /api/webhook/status
 */
export async function handleStatusCallback(req, res) {
  try {
    const { MessageSid, MessageStatus, To } = req.body;

    if (MessageSid && MessageStatus) {
      const phone = To?.replace('whatsapp:', '');

      if (phone) {
        // Update the message status in the user's messages array
        await User.updateOne(
          { phone, 'messages.message_id': MessageSid },
          { $set: { 'messages.$.status': MessageStatus } }
        );
        console.log(`📋 Status update | SID: ${MessageSid} | Status: ${MessageStatus}`);
      }
    }

    res.status(200).send('<Response></Response>');
  } catch (error) {
    console.error('❌ Status callback error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}
