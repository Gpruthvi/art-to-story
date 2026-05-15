import { fal } from '@fal-ai/client';
import dotenv from 'dotenv';

dotenv.config();

fal.config({
  credentials: process.env.FAL_KEY,
});

export const generateImage = async (prompt: string, characterImages: string[]): Promise<string> => {
  // For the final product, we would use a specialized character consistency model or train a LoRA.
  // Here we use fal-ai/flux/dev with a descriptive prompt as a starting point.
  // Advanced: train a LoRA using characterImages and then use it here.
  
  const result = await fal.subscribe('fal-ai/flux/dev', {
    input: {
      prompt: prompt,
      image_size: 'landscape_4_3',
      num_inference_steps: 28,
      guidance_scale: 3.5,
    },
    pollInterval: 1000,
  });

  if (result.error) throw new Error(`Fal generation failed: ${result.error}`);
  
  const images = (result.data as any).images;
  if (!images || images.length === 0) throw new Error('No images returned from Fal');

  return images[0].url;
};

export const trainCharacterModel = async (imageUrls: string[]): Promise<string> => {
  // Rapid LoRA training on Fal
  const result = await fal.subscribe('fal-ai/flux-lora-fast-training', {
    input: {
      images: imageUrls.map(url => ({ url })),
      trigger_word: 'CHILDPERSON',
      steps: 1000,
    },
  });

  if (result.error) throw new Error(`Training failed: ${result.error}`);
  
  return (result.data as any).diffusers_lora_file.url;
};
