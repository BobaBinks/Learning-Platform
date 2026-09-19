import express from "express";
import dotenv from "dotenv";
import db from './config/db.js';
import dns from 'dns';
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import cors from 'cors'
import cookieParser from "cookie-parser";


// dotenv.config({ path: "./.env.backend" });
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const app = express();

app.use(express.json());

app.use(cors({origin: 'http://localhost:5173'}));
app.use(cookieParser())

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// app.use("/", (req, res) => {
//     res.cookie('test-cookie', 'hihi', { httpOnly: true })
//     return res.status(200).json("cookie set")
// })

// app.use("/hi", (req, res) => {
//     // Cookies that have not been signed
//     console.log('Cookies: ', req.cookies)

//     // Cookies that have been signed
//     console.log('Signed Cookies: ', req.signedCookies)
//     return res.status(200).json("cookie")
// })


const port = process.env.PORT || 3000;

// connect to postgresql hosted on render
if (db) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })
} else {
    console.log("Could not connect to database!");
}

export default app;
