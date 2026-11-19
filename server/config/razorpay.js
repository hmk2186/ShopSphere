const Razorpay = require('razorpay');

const isRazorpayConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET &&
  !process.env.RAZORPAY_KEY_ID.includes('your_key') &&
  !process.env.RAZORPAY_KEY_SECRET.includes('your_secret')
);

let razorpayInstance = null;

if (isRazorpayConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.warn('[Razorpay] Initialization warning:', err.message);
  }
}

module.exports = {
  razorpay: razorpayInstance,
  isRazorpayConfigured,
};
