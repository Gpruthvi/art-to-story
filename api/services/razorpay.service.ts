import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export const createOrder = async (amount: number, currency: string = 'INR'): Promise<any> => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id') {
    console.warn('Razorpay keys missing, using mock order');
    return { id: 'order_mock_' + Date.now() };
  }
  const options = {
    amount: amount * 100, // amount in smallest currency unit
    currency,
    receipt: `receipt_${Date.now()}`,
  };
  return await razorpay.orders.create(options);
};

export const verifyPayment = (orderId: string, paymentId: string, signature: string): boolean => {
  if (orderId.startsWith('order_mock_')) return true;
  if (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_key_secret') {
    return true;
  }
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};
