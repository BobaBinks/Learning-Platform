import db from "../config/db.js";
import { usersTable } from "../db/schema.js"

const getAllUsers = async (req, res) => {
    try {
        const result = await db.select().from(usersTable);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json("Something went wrong");
        console.log("Error", error);
    }
}

const createUser = async (req, res) => {
    try {
        const [username, email, password] = req.body;
        console.log("Request.Boldy: ", req.body);
    } catch (error) {
        
    }
}


export {
    getAllUsers,
    createUser,
}