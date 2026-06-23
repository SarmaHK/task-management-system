import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
}

const getConfig = (): EnvConfig => {
  const { PORT, NODE_ENV, DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET } = process.env;

  if (!PORT) {
    console.warn('PORT is not defined in .env, defaulting to 5000');
  }

  return {
    PORT: parseInt(PORT || '5000', 10),
    NODE_ENV: NODE_ENV || 'development',
    DATABASE_URL: DATABASE_URL || '',
    JWT_SECRET: JWT_SECRET || '',
    JWT_REFRESH_SECRET: JWT_REFRESH_SECRET || JWT_SECRET || '',
  };
};

export const config = getConfig();
