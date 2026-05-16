import { Request, Response } from 'express';
import { prisma } from '../index';
import { createOrder as createRazorpayOrder, verifyPayment } from '../services/razorpay.service';
import { inngest } from '../services/inngest.client';
import { uploadToSupabase } from '../services/storage.service';

export const initOrder = async (req: Request, res: Response) => {
  try {
    const { email, name, theme, amount } = req.body;
    
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, name } });
    }

    const razorpayOrder = await createRazorpayOrder(amount);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: amount,
        theme,
        status: 'PENDING',
      },
    });

    res.json({ 
      orderId: order.id, 
      razorpayOrderId: razorpayOrder.id,
      demoMode: process.env.DEMO_MODE === 'true'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handlePaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const isValid = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) return res.status(400).json({ error: 'Invalid payment signature' });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    });

    // Send event to Inngest for background processing
    if (!process.env.INNGEST_EVENT_KEY || process.env.INNGEST_EVENT_KEY === 'your_inngest_event_key' || process.env.INNGEST_EVENT_KEY === '') {
      console.warn('Inngest keys missing, triggering background logic inline');
      // For the prototype, we trigger the logic directly in a non-awaited way
      fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5001'}/api/inngest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'app/order.paid', data: { orderId } })
      }).catch(err => console.error('Inline trigger failed:', err));
    } else {
      await inngest.send({
        name: "app/order.paid",
        data: { orderId },
      });
    }

    res.json({ message: 'Payment verified and processing started' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadAssets = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

    for (const file of files) {
      const url = await uploadToSupabase(file.buffer, file.originalname);
      await prisma.asset.create({
        data: {
          orderId,
          url,
          type: 'UPLOAD',
        },
      });
    }

    res.json({ message: 'Assets uploaded successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { storyBook: true },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
