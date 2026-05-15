import { Request, Response } from 'express';
import { prisma } from '../index';
import { createOrder as createRazorpayOrder, verifyPayment } from '../services/razorpay.service';
import { storyQueue } from '../services/queue.service';
import { uploadBuffer } from '../services/cloudinary.service';

export const initOrder = async (req: Request, res: Response) => {
  try {
    const { email, name, theme, amount } = req.body;
    
    // 1. Create or find user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, name } });
    }

    // 2. Create Razorpay Order
    const razorpayOrder = await createRazorpayOrder(amount);

    // 3. Create DB Order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: amount,
        theme,
        status: 'PENDING',
      },
    });

    res.json({ orderId: order.id, razorpayOrderId: razorpayOrder.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handlePaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const isValid = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) return res.status(400).json({ error: 'Invalid payment signature' });

    // Update order status and trigger AI generation
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    });

    await storyQueue.add('generate', { orderId });

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
      const url = await uploadBuffer(file.buffer);
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
