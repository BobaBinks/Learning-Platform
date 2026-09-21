import db from "../config/db.js";
import bcrypt from 'bcrypt';
import errorFormatter from "../utils/errorFormatter.js";
import jwt from 'jsonwebtoken'

import { validationResult, matchedData } from "express-validator";
import { eq } from "drizzle-orm";
import { usersTable, gendersTable, rolesTable } from "../db/schema.js"

const login = async (req, res) => {
    try {
        // validate input
        const validationRes = validationResult(req).formatWith(errorFormatter)

        if (!validationRes.isEmpty()) {
            return res.status(400).json({ errors: validationRes.array() })
        }

        const data = matchedData(req)

        // get user
        const result = await db.select({
            id: usersTable.id,
            email: usersTable.email,
            password: usersTable.password
        }).from(usersTable).where(eq(usersTable.email, data.email))

        if (result.length > 0) {

            // compare password
            const passwordMatch = await bcrypt.compare(data.password, result[0].password)

            if (passwordMatch) {
                // generate jwt token and add to response
                // return status code 200
                const token = jwt.sign({
                    id: result[0].id,
                }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })

                res.cookie('jwt', token, {
                    httpOnly: true,
                })
                
                return res.status(200).json("Logged In")
            }

            // if login fail return status code 400 
            console.error("Password does not match")
            return res.status(400).json("Login Failed")
        }
        
        // user does not exist
        console.error("User does not exist.")
        return res.status(400).json("Login Failed")


    } catch (error) {
        console.log(error)
        return res.status(500).json("Something went wrong")
    }
}

const loggedInUser = async (req, res) => {
    try {
        // get public user details
        if (Object.hasOwn(req, 'decoded') && Object.hasOwn(req.decoded, 'id')) {
            const decoded = req.decoded
            console.log("decoded: ", decoded)

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
                .where(eq(usersTable.id, decoded.id))
                .leftJoin(rolesTable, eq(usersTable.rolesId, rolesTable.id))
                .leftJoin(gendersTable, eq(usersTable.genderId, gendersTable.id))

            if (result.length === 0) {
                return res.status(404).json("User not found")
            }
            
            return res.status(200).json(result[0])
        }

        return res.status(404).json('token not found')
    } catch (error) {
        console.log(error)
        return res.status(500).json("Something went wrong.")
    }
}

const logout = async (req, res) => {
    // delete jwt token
    res.clearCookie('jwt')

    return res.status(200).json("Logged out")
}

export {
    login,
    loggedInUser,
    logout,
}