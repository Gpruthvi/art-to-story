import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadToSupabase = async (fileBuffer: Buffer | string, fileName: string, bucket: string = 'story-assets'): Promise<string> => {
  let body = fileBuffer;

  // If it's a URL (from Pollinations), download it first
  if (typeof fileBuffer === 'string' && fileBuffer.startsWith('http')) {
    const response = await fetch(fileBuffer);
    const arrayBuffer = await response.arrayBuffer();
    body = Buffer.from(arrayBuffer);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${Date.now()}-${fileName}`, body, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
};
