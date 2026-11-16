import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'sfuxk5xi',
  api_key: process.env.CLOUDINARY_API_KEY || '337839555964131',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'jAUlmmzMA2dcCr6qKnG0mmV8mpE',
  secure: true
});

export default cloudinary;
