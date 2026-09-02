import express from "express";
import dotenv from "dotenv";
import db from './config/db.js';
import dns from 'dns';
import userRoutes from './routes/userRoutes.js'


dotenv.config({ path: "../.env" });
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const app = express();

app.use("/users", userRoutes);

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
