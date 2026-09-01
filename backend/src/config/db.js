import dotenv from "dotenv";
import { drizzle } from 'drizzle-orm/node-postgres';

// path is relative to cwd which is /backend
dotenv.config({ path: "../.env" });

const db = drizzle(process.env.POSTGRESQL_EXTERNAL_URL);

export default db;