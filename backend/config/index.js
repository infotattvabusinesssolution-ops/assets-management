import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fams_enterprise?replicaSet=rs0',
  mongoUriFallback: process.env.MONGO_URI_FALLBACK || 'mongodb://127.0.0.1:27017/fams_enterprise',
  jwt: {
    secret: process.env.JWT_SECRET || 'fams-enterprise-jwt-super-secret-key-2026',
    accessExpiry: '1d',
    refreshExpiry: '7d'
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    enabled: process.env.REDIS_ENABLED === 'true'
  },
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  ai: {
    provider: process.env.AI_PROVIDER || 'mock', // mock | openai | azure
    apiKey: process.env.AI_API_KEY || 'mock-key'
  }
};
