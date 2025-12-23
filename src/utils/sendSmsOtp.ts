import axios from "axios";

export const sendSmsOtp = async (phone: string, otp: string): Promise<boolean> => {
  try {
    const authKey = process.env.SMS_AUTH_KEY || "68e03ecd12fbd8b59be813d553356951";
    const senderId = "JODIMN"; // As per PHP snippet payload
    const endpoint = `https://msg.msgclub.net/rest/services/sendSMS/sendGroupSms?AUTH_KEY=${authKey}`; // Try HTTPS

    const message = `Your login OTP for JODIMILAN is ${otp}. It is valid for 10 minutes. Do not share this OTP with anyone. - JODIMILAN`;

    console.log(`[SMS] Sending OTP to ${phone}`);

    const payload = {
      smsContent: message,
      routeId: "8",
      mobileNumbers: phone,
      senderId: senderId,
      smsContentType: "ENGLISH",
    };

    const response = await axios.post(endpoint, payload, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      timeout: 30000, // Increased to 30s
    });

    if (response.status === 200) {
      console.log(`[SMS] Sent successfully. Response:`, response.data);
      return true;
    } else {
      console.warn(`[SMS] Failed with status ${response.status}`, response.data);
      return false;
    }
  } catch (error: any) {
    console.error("[SMS] Error sending OTP:", error.message);
    if (error.response) {
        console.error("[SMS] Response data:", error.response.data);
    }
    return false;
  }
};
