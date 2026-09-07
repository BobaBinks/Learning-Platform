
import { defineConfig } from 'drizzle-kit';
import { getDatabaseURL } from "./src/utils/dbUtils.js";

let DB_URL = getDatabaseURL();

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: DB_URL,
  },
});