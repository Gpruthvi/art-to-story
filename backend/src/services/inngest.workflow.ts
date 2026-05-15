import { inngest } from "./inngest.client";
import { prisma } from "../index";
import { generateStoryScript } from "./openai.service";
import { generateImage } from "./fal.service";
import { uploadImage, uploadBuffer } from "./cloudinary.service";
import { generateStoryPdf } from "./pdf.service";

export const generateStorybookWorkflow = inngest.createFunction(
  { id: "generate-storybook-workflow" },
  { event: "app/order.paid" },
  async ({ event, step }) => {
    const { orderId } = event.data;

    // 1. Update order status
    await step.run("update-order-processing", async () => {
      return await prisma.order.update({
        where: { id: orderId },
        data: { status: "PROCESSING" },
      });
    });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { assets: { where: { type: "UPLOAD" } } },
    });

    if (!order) throw new Error("Order not found");

    // 2. Generate Story Script
    const script = await step.run("generate-script", async () => {
      const childDescription = "a child based on the uploaded drawings";
      return await generateStoryScript(order.theme || "Magic Forest", childDescription);
    });

    // 3. Generate Images (Sequential to avoid serverless memory limits)
    const imageUrls = order.assets.map((a) => a.url);
    const pagesWithImages = [];

    for (const [index, page] of script.pages.entries()) {
      const pageData = await step.run(`generate-page-image-${index}`, async () => {
        const falUrl = await generateImage(page.imagePrompt, imageUrls);
        const cloudinaryUrl = await uploadImage(falUrl);
        
        // Store generated asset
        await prisma.asset.create({
          data: {
            orderId: order.id,
            url: cloudinaryUrl,
            type: "GENERATED",
          },
        });

        return { ...page, imageUrl: cloudinaryUrl };
      });
      pagesWithImages.push(pageData);
    }

    // 4. Create PDF and Finalize
    await step.run("generate-pdf-and-finalize", async () => {
      const pdfBuffer = await generateStoryPdf(script.title, pagesWithImages);
      const pdfUrl = await uploadBuffer(pdfBuffer, "storybooks");

      await prisma.storyBook.create({
        data: {
          orderId: order.id,
          title: script.title,
          content: pagesWithImages as any,
          pdfUrl: pdfUrl,
        },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { status: "COMPLETED" },
      });

      return { pdfUrl };
    });

    return { message: "Storybook generated successfully" };
  }
);
