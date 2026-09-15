import db from "../config/db.js";
import bcrypt from 'bcrypt';
import errorFormatter from "../utils/errorFormatter.js";

import { validationResult, matchedData } from "express-validator";
import { eq } from "drizzle-orm";
import { usersTable, gendersTable, rolesTable } from "../db/schema.js"

const saltRounds = 10;

const getAllUsers = async (req, res) => {
    try {
        const result = await db.select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            age: usersTable.age,
            role: rolesTable.name,
            gender: gendersTable.name,
            createdAt: usersTable.createdAt,
            updatedAt: usersTable.updatedAt
        }).from(usersTable)
            .leftJoin(rolesTable, eq(usersTable.rolesId, rolesTable.id))
            .leftJoin(gendersTable, eq(usersTable.genderId, gendersTable.id))

        res.status(200).json(result);
    } catch (error) {
        console.log("Error", error);
        return res.status(500).json("Something went wrong");
    }
}

const getUser = async (req, res) => {
    try {
        const validationRes = validationResult(req).formatWith(errorFormatter);

        if (!validationRes.isEmpty()) {
            return res.status(400).json({ error: validationRes.array() });
        }

        const data = matchedData(req);

        // get user data 
        const user = await db.select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            age: usersTable.age,
            gender: gendersTable.name,  // get gender name from genders table via left join
            role: rolesTable.name,      // get role name from roles table via left join
            createdAt: usersTable.createdAt,
            updatedAt: usersTable.updatedAt
        })
        .from(usersTable)
        .where(eq(usersTable.id, data.id))
        .leftJoin(rolesTable, eq(rolesTable.id, usersTable.rolesId))
        .leftJoin(gendersTable, eq(gendersTable.id, usersTable.genderId)).limit(1);


        if (user.length > 0)
            return res.status(200).json({ "user": user[0] });

        return res.status(400).json("User does not exist.");
    } catch (error) {
        console.log("Error", error);
        return res.status(500).json("Something went wrong");
    }

}

const createUser = async (req, res) => {
    try {
        const result = validationResult(req).formatWith(errorFormatter);

        // checks if validation has errors
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array({ onlyFirstError: true }) });

        const data = matchedData(req);

        // check if user already exists
        const userExist = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.email, data['email']));


        // if yes, return user exist error
        if (userExist.length > 0) {
            return res.status(409).json("Failed to create user, email already in use.");
        }

        // hash password
        data['password'] = await bcrypt.hash(data['password'], saltRounds);

        // if no, create new user
        const user = await db.insert(usersTable).values(data).returning({ insertedId: usersTable.id });

        if (user.length > 0)
            return res.status(200).json({ "message": "User created successfully.", "id": user[0].insertedId });
        return res.status(400).json({ "message": "Failed to create user." });

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
        if (!result.isEmpty()) return res.status(400).json({ errors: result.array({ onlyFirstError: true }) });

        const data = matchedData(req);

        // extract fields to be updated from data
        var fieldsToUpdate = {}

        if (Object.hasOwn(data, 'name')) fieldsToUpdate['name'] = data['name'];

        if (Object.hasOwn(data, 'email')) fieldsToUpdate['email'] = data['email'];

        if (Object.hasOwn(data, 'age')) fieldsToUpdate['age'] = data['age'];

        if (Object.hasOwn(data, 'password')) {
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

const deleteUser = async (req, res) => {
    try {
        const validationRes = validationResult(req).formatWith(errorFormatter);

        if (!validationRes.isEmpty()) {
            return res.status(400).json({ error: validationRes.array({ onlyFirstError: false }) });
        }

        const data = matchedData(req);

        const result = await db.delete(usersTable).where(eq(usersTable.id, data.id)).returning({ id: usersTable.id });

        if (result.length > 0)
            return res.status(200).json(`User ID ${result[0].id} deleted successfully.`);

        return res.status(404).json("User does not exist.");
    } catch (error) {
        console.log("Error", error);
        return res.status(500).json("Something went wrong");
    }
}

export {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
}