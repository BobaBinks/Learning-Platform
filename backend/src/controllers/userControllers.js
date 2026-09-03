import db from "../config/db.js";
import { usersTable } from "../db/schema.js"
import bcrypt from 'bcrypt';

const saltRounds = 10;

const getAllUsers = async (req, res) => {
    try {
        const result = await db.select().from(usersTable);

        res.status(200).json({ "users": result });
    } catch (error) {
        res.status(500).json("Something went wrong");
        console.log("Error", error);
    }
}

const createUser = async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        // basic input validation
        if(!name || !email || !password || !age){
            return res.status(400).json("Invalid credentials.");
        }
        
        // check if user already exists
        const userExist = await db.select({
            email: usersTable.email
        }).from(usersTable);
        
        // if yes, return user exist error
        if(userExist.length !== 0){
            return res.status(409).json("Failed to create user, email already in use.");
        }
            
        // hash password
        const hashedPassword = await bcrypt.hash(password,saltRounds);

        // if no, create new user
        const user = await db.insert(usersTable).values({
            name: name, 
            email: email, 
            password: hashedPassword, 
            age: age
        });

        return res.status(200).json("User created successfully.");

    } catch (error) {
        res.status(500).json("Something went wrong");
        console.log("Error", error);
    }
}

const updateUser = async () => {

}

export {
    getAllUsers,
    createUser,
    updateUser
}