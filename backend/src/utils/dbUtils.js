import dotenv from "dotenv";

const getDatabaseURL = () => {
    switch (process.env.NODE_ENV) {
        case "test":
            dotenv.config({ path: "./.env.backend.test" });
            return process.env.POSTGRESQL_TEST_DATABASE_URL;
        case "development":
            dotenv.config({ path: "./.env.backend" });
            return process.env.POSTGRESQL_EXTERNAL_URL;
        case "production":
            // should be separate from dev
            dotenv.config({ path: "./.env.backend" });
            return process.env.POSTGRESQL_EXTERNAL_URL;
        default:
            console.log("Current NODE_ENV is not valid option.")
            return undefined;
    }
}

export {
    getDatabaseURL
};