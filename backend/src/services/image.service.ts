import axios from 'axios';

/**
 * Generates an image using the free Pollinations.ai API.
 * No API key required. Completely free.
 */
export const generateImageFree = async (prompt: string): Promise<string> => {
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
  
  // Verify the image can be loaded
  await axios.get(imageUrl);
  
  return imageUrl;
};
