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

const updateUser = async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        // basic validation
        if(Object.keys(req.body).length === 0){
            return res.status(400).json({"message": "No data provided for update!"});
        }
        
        var valuesToUpdate = {};

        // check if the keys are valid
        if(name){
            var trimmedName = name.trim();
            if(trimmedName !== ""){
                valuesToUpdate["name"] = trimmedName;
            }
        }

        if(email){
            // validate the format is correct
            // add to valuesToUpdate
        }

        if(password){
            // validate password format is correct
            // hash password
            // add to valuesToUpdate
        }

        if(age && age >= 0 && age < 150){
            valuesToUpdate['age'] = age;
        }

        // check if the values are valid
        if(Object.keys(valuesToUpdate).length === 0){
            return res.status(400).json({"message": "No valid data provided for update!"});
        }
        
        // const updateUser = await db.update(usersTable).set({
        //     name: name ? name : 
        // }).where(eq(usersTable.id, req.params.id));
        
        return res.status(200).json("User updated succcessfully.");

        } catch (error) {
        res.status(500).json("Something went wrong");
        console.log("Error", error);
    }
}

export {
    getAllUsers,
    createUser,
    updateUser
}