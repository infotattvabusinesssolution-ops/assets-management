import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dk4iwkh0h',
  api_key: process.env.CLOUDINARY_API_KEY || '982347999286849',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'X5iiHFV0Ox4P1ZR7AnytII-7fRI',
  secure: true
});

export default cloudinary;
