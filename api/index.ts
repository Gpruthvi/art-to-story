import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { serve } from "inngest/express";
import { inngest } from "./services/inngest.client";
import { generateStorybookWorkflow } from "./services/inngest.workflow";
import orderRoutes from './routes/order.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Inngest route
app.use("/api/inngest", serve({ client: inngest, functions: [generateStorybookWorkflow] }));

// Routes
app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Art-to-Story API is running' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
export { prisma };
