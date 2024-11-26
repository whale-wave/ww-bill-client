import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

export default {
  appName: process.env.VITE_APP_NAME || '鲸浪账本',
  defaultHost: process.env.VITE_DEV_HOST || 'http://localhost:3001',
};
