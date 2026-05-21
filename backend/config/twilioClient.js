import twilio from 'twilio';

const accountSid = process.env.TWILLIO_ACCOUNT_SID;
const authToken = process.env.TWILLIO_AUTH_TOKEN;
const senderNumber = process.env.TWILLIO_SENDER_NUMBER;

// Validate Twilio credentials on startup
if (!accountSid || !authToken || !senderNumber) {
  console.error('⚠️  Missing Twilio credentials in .env file');
}

const client = twilio(accountSid, authToken);

/**
 * Send a WhatsApp message via Twilio
 * @param {string} to - Recipient phone number (e.g., "+923001234567")
 * @param {string} body - Message text
 * @returns {Promise} Twilio message response
 */
export async function sendWhatsAppMessage(to, body) {
  try {
    // Format numbers for WhatsApp
    const fromWhatsApp = `whatsapp:${senderNumber}`;
    const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    const message = await client.messages.create({
      from: fromWhatsApp,
      to: toWhatsApp,
      body: body,
    });

    console.log(`✅ Message sent | SID: ${message.sid} | To: ${to}`);
    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
    };
  } catch (error) {
    console.error(`❌ Failed to send message to ${to}:`, error.message);
    throw error;
  }
}

export default client;
