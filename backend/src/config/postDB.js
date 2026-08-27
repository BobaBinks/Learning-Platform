import pgPromise from 'pg-promise';
import dotenv from "dotenv";

// path is relative to cwd which is /backend
dotenv.config({ path: "../.env" });

const connectDB = () => {
    try {
        const pgp = pgPromise();

        const db = pgp(process.env.POSTGRESQL_EXTERNAL_URL);
        return db;
    } catch (error) {
        console.log("Error: ", error);
        process.exit(1);
    }
}

const db = connectDB();

export default db;

