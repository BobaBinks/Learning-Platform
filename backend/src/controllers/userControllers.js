import db from "../config/db.js";
import bcrypt, { hashSync } from 'bcrypt';
import errorFormatter from "../utils/errorFormatter.js";

import { validationResult, matchedData } from "express-validator";
import { eq } from "drizzle-orm";
import { usersTable } from "../db/schema.js"

const saltRounds = 10;

const getAllUsers = async (req, res) => {
    try {
        const result = await db.select().from(usersTable);

        res.status(200).json({ "users": result });
    } catch (error) {
        console.log("Error", error);
        return res.status(500).json("Something went wrong");
    }
}

const createUser = async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        // basic input validation
        if (!name || !email || !password || !age) {
            return res.status(400).json("Invalid credentials.");
        }

        // check if user already exists
        const userExist = await db.select({
            email: usersTable.email
        }).from(usersTable);

        // if yes, return user exist error
        if (userExist.length !== 0) {
            return res.status(409).json("Failed to create user, email already in use.");
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // if no, create new user
        const user = await db.insert(usersTable).values({
            name: name,
            email: email,
            password: hashedPassword,
            age: age
        });

        return res.status(200).json("User created successfully.");

    } catch (error) {
        console.log("Error", error);
        return res.status(500).json("Something went wrong");
    }
}

const updateUser = async (req, res) => {
    /**
     * strong password defaults to
     * {
     *    minLength: 8|
     *    minLowercase: 1|
     *    minUppercase: 1|
     *    minNumbers: 1|
     *    minSymbols: 1|
     *    returnScore: false|
     *    pointsPerUnique: 1|
     *    pointsPerRepeat: 0.5|
     *    pointsForContainingLower: 10|
     *    pointsForContainingUpper: 10|
     *    pointsForContainingNumber: 10|
     *    pointsForContainingSymbol: 10
     * }
     */
    try {
        const result = validationResult(req).formatWith(errorFormatter);

        // checks if validation has errors
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array() });

        const data = matchedData(req);
        
        console.log("Data:", data);

        // extract fields to be updated from data
        var fieldsToUpdate = {}

        if (Object.hasOwn(data,'name')) fieldsToUpdate['name'] = data['name'];

        if (Object.hasOwn(data,'email')) fieldsToUpdate['email'] = data['email'];

        if (Object.hasOwn(data,'age')) fieldsToUpdate['age'] = data['age'];

        if (Object.hasOwn(data,'password')) {
            // hash new password
            const hashedPassword = await bcrypt.hash(data['password'], saltRounds);
            fieldsToUpdate['password'] = hashedPassword;
        }

        // checks if there are any fields that survived validation checks and was added to fieldsToUpdate
        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ "message": "No data provided for update!" });
        }

        const updateUserResult = await db.update(usersTable).set(fieldsToUpdate).where(eq(usersTable.id, req.params.id)).returning();

        // checks if user was found and updated
        if (updateUserResult.length > 0)
            return res.status(200).json({ "message": "User updated succcessfully." });

        return res.status(404).json({ "message": "User not found." });

    } catch (error) {
        console.log("Error", error);
        return res.status(500).json("Something went wrong");
    }
}

export {
    getAllUsers,
    createUser,
    updateUser
}