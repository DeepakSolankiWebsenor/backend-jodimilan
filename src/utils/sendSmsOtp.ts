export const sendSmsOtp = async (phone: string, otp: string): Promise<boolean> => {
  console.log(`[SMS-MOCK] Sending OTP ${otp} to ${phone}`);
  // Return true to simulate success
  return true;
};
