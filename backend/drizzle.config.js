import dotenv from "dotenv";
import { defineConfig } from 'drizzle-kit';

// path is relative to cwd which is /backend
dotenv.config({ path: "../.env" });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRESQL_EXTERNAL_URL,
  },
});