import twilio from 'twilio';

// Initialize the Twilio client only if the keys exist in the environment
// You will need to add these to your .env file in the future
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; 

let client: any = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export async function sendWhatsAppMessage(to: string, message: string) {
  // Format the recipient phone number correctly
  let formattedPhone = to.replace(/\s+/g, '');
  if (!formattedPhone.startsWith('+')) {
    // Assuming India country code (+91) as default based on business location
    formattedPhone = `+91${formattedPhone}`;
  }
  
  if (client) {
    try {
      const result = await client.messages.create({
        body: message,
        from: twilioWhatsAppNumber,
        to: `whatsapp:${formattedPhone}`
      });
      console.log(`[WhatsApp API] Message sent successfully to ${formattedPhone}. SID: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error(`[WhatsApp API Error] Failed to send message to ${formattedPhone}:`, error);
      return { success: false, error };
    }
  } else {
    // Graceful fallback if keys are not configured yet
    console.log(`\n======================================`);
    console.log(`[WhatsApp API Sandbox] Simulation Mode`);
    console.log(`To: ${formattedPhone}`);
    console.log(`Message:\n${message}`);
    console.log(`======================================\n`);
    return { success: true, mock: true };
  }
}
