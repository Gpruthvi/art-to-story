import puppeteer from 'puppeteer';

export const generateStoryPdf = async (title: string, pages: any[]): Promise<Buffer> => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: serif; text-align: center; padding: 40px; }
          .page { page-break-after: always; }
          img { max-width: 100%; border-radius: 10px; margin-bottom: 20px; }
          h1 { font-size: 36px; margin-bottom: 40px; }
          p { font-size: 24px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="page">
          <h1>${title}</h1>
        </div>
        ${pages.map((p, i) => `
          <div class="page">
            <img src="${p.imageUrl}" />
            <p>${p.text}</p>
          </div>
        `).join('')}
      </body>
    </html>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: 'A4' });

  await browser.close();
  return pdfBuffer;
};
