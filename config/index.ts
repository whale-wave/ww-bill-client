import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

export default {
  appName: process.env.VITE_APP_NAME || '鲸浪记账',
  defaultHost: process.env.VITE_DEV_HOST || 'https://bill.easyhappy.top',
};
