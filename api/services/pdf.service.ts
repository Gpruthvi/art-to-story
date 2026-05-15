import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const generateStoryPdf = async (title: string, pages: any[]): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: serif; text-align: center; padding: 40px; background: #fff; }
          .page { page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
          img { max-width: 80%; border-radius: 20px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          h1 { font-size: 48px; color: #1e293b; margin-bottom: 40px; }
          p { font-size: 28px; line-height: 1.6; color: #475569; max-width: 80%; }
        </style>
      </head>
      <body>
        <div class="page">
          <h1>${title}</h1>
        </div>
        ${pages.map((p) => `
          <div class="page">
            <img src="${p.imageUrl}" />
            <p>${p.text}</p>
          </div>
        `).join('')}
      </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ 
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  await browser.close();
  return pdfBuffer as Buffer;
};
