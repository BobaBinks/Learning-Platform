import dotenv from "dotenv";
import { drizzle } from 'drizzle-orm/node-postgres';
import { getDatabaseURL } from "../utils/dbUtils.js";

// path is relative to cwd which is /backend
// dotenv.config({ path: "./.env.backend" });
const databaseURL = getDatabaseURL();
const db = drizzle(databaseURL);

export default db;