import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface StoryPage {
  pageNumber: number;
  text: string;
  imagePrompt: string;
}

export interface StoryScript {
  title: string;
  pages: StoryPage[];
}

export const generateStoryWithGemini = async (theme: string, imageUrls: string[]): Promise<StoryScript> => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
    console.warn('Gemini API key missing, using mock story');
    return {
      title: `The Magic of ${theme}`,
      pages: [
        {
          pageNumber: 1,
          text: "Once upon a time, in a world full of color, a new hero appeared.",
          imagePrompt: "A whimsical character in a vibrant forest, oil painting style"
        },
        {
          pageNumber: 2,
          text: "With a single drawing, they could make anything come to life!",
          imagePrompt: "A child drawing in the air with a glowing pencil"
        }
      ]
    };
  }
  const prompt = `
    I am uploading images of a child's drawing. 
    1. First, analyze the character in the drawing.
    2. Then, write a 10-page children's storybook script based on the theme: "${theme}".
...

    For each page, provide:
    1. The story text (2-3 whimsical sentences).
    2. A detailed image generation prompt. IMPORTANT: Use a consistent physical description for the character on every page so they look the same.
    
    Return the response in strictly valid JSON format:
    {
      "title": "Story Title",
      "pages": [
        {
          "pageNumber": 1,
          "text": "...",
          "imagePrompt": "..."
        }
      ]
    }
  `;

  // For the final product, we would actually pass the image data to Gemini 1.5 Pro
  // For now, we use the text-based orchestration
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Clean JSON from potential markdown markers
  const jsonStr = text.replace(/```json|```/g, "").trim();
  return JSON.parse(jsonStr) as StoryScript;
};
