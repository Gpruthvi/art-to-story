import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../index';
import { generateStoryScript } from './openai.service';
import { generateImage } from './fal.service';
import { generateStoryPdf } from './pdf.service';
import { uploadImage, uploadBuffer } from './cloudinary.service';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

export const storyQueue = new Queue('story-generation', { connection });

export const storyWorker = new Worker(
  'story-generation',
  async (job: Job) => {
    const { orderId } = job.data;
    
    try {
      // 1. Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
      });

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { assets: { where: { type: 'UPLOAD' } } },
      });

      if (!order) throw new Error('Order not found');

      // 2. Generate Story Script
      const childDescription = "a child based on the uploaded drawings"; // In a real app, we'd extract this
      const script = await generateStoryScript(order.theme || 'Magic Forest', childDescription);

      // 3. Generate Images for each page
      const imageUrls = order.assets.map(a => a.url);
      const pagesWithImages = [];

      for (const page of script.pages) {
        const falUrl = await generateImage(page.imagePrompt, imageUrls);
        const cloudinaryUrl = await uploadImage(falUrl);
        
        pagesWithImages.push({
          ...page,
          imageUrl: cloudinaryUrl,
        });

        // Store generated asset
        await prisma.asset.create({
          data: {
            orderId: order.id,
            url: cloudinaryUrl,
            type: 'GENERATED',
          },
        });
      }

      // 4. Create StoryBook record
      const pdfBuffer = await generateStoryPdf(script.title, pagesWithImages);
      const pdfUrl = await uploadBuffer(pdfBuffer, 'storybooks');

      await prisma.storyBook.create({
        data: {
          orderId: order.id,
          title: script.title,
          content: pagesWithImages as any,
          pdfUrl: pdfUrl,
        },
      });

      // 5. Mark Order as COMPLETED
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' },
      });

      console.log(`Successfully generated storybook for order ${orderId}`);
    } catch (error) {
      console.error(`Failed to process order ${orderId}:`, error);
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  },
  { connection }
);
