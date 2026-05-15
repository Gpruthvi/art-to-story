# StoryForge: AI-Powered "Art-to-Story" Platform

Transform children's drawings and photos into personalized, consistent illustrated storybooks.

## Project Structure
- `frontend/`: React (Vite) + TailwindCSS.
- `backend/`: Node.js (Express) + TypeScript + Prisma.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis (for background jobs)

### 2. Backend Setup
1. `cd backend`
2. Configure `.env` with your API keys (OpenAI, Fal.ai, Cloudinary, Razorpay).
3. `npm install`
4. `npx prisma generate`
5. `npx prisma migrate dev`
6. `npm run dev`

### 3. Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Core Workflow
1. **Upload:** User uploads 3-5 images and selects a theme.
2. **Pay:** Payment processed via Razorpay (simulated in demo).
3. **Generate:** Backend triggers a BullMQ worker:
   - OpenAI generates a 10-page script.
   - Fal.ai illustrates consistent characters for each page.
   - Puppeteer generates a final PDF.
4. **Deliver:** User downloads the story from the dashboard.
