import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import dns from 'dns';

import db from "./config/postDB.js"

dotenv.config({ path: "../.env" });
const app = express();

// app.use("/users", userRoutes);

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const port = process.env.PORT || 3000;

// connect to postgresql hosted on render
if (db) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })
} else {
    console.log("Could not connect to database!");
}



// connect to mongodb
// connectDB().then(() => {
//     app.listen(port, () => {
//         console.log(`Server is running on port ${port}`);
//     })
// })
