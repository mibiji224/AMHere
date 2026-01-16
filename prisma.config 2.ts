import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

// 1. Load the .env file manually
dotenv.config();

export default defineConfig({
  // 2. Now process.env.DATABASE_URL will actually have a value
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL, 
  },
  
  migrations: {
    seed: 'npx ts-node prisma/seed.ts',
  },
});