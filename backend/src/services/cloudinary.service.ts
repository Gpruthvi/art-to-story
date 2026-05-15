import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileUrl: string, folder: string = 'art-to-story'): Promise<string> => {
  const result = await cloudinary.uploader.upload(fileUrl, {
    folder: folder,
  });
  return result.secure_url;
};

export const uploadBuffer = async (buffer: Buffer, folder: string = 'art-to-story'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || '');
      }
    );
    uploadStream.end(buffer);
  });
};
