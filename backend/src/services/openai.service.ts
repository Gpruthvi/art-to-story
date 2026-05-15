import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface StoryPage {
  pageNumber: number;
  text: string;
  imagePrompt: string;
}

export interface StoryScript {
  title: string;
  pages: StoryPage[];
}

export const generateStoryScript = async (theme: string, childDescription: string): Promise<StoryScript> => {
  const prompt = `
    Create a 10-page children's storybook script based on the theme: "${theme}".
    The main character is: ${childDescription}.
    
    For each page, provide:
    1. The story text (2-3 sentences).
    2. A detailed image generation prompt for an AI to illustrate the scene. 
       The character should be described consistently in every prompt (e.g., "a 5-year-old girl with curly brown hair wearing a red cape").
    
    Return the response in JSON format:
    {
      "title": "Story Title",
      "pages": [
        {
          "pageNumber": 1,
          "text": "...",
          "imagePrompt": "..."
        },
        ...
      ]
    }
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a professional children\'s storybook writer and illustrator.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Failed to generate story script');

  return JSON.parse(content) as StoryScript;
};
