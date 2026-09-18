import db from "../config/db.js";
import bcrypt from 'bcrypt';
import errorFormatter from "../utils/errorFormatter.js";

import { validationResult, matchedData } from "express-validator";
import { eq } from "drizzle-orm";
import { usersTable } from "../db/schema.js"

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
            email: usersTable.email,
            password: usersTable.password
        }).from(usersTable).where(eq(usersTable.email, data.email))

        if(result.length > 0){
            
        // compare password
        const passwordMatch = await bcrypt.compare(data.password, result[0].password) 
        
        if(passwordMatch){
            // generate jwt token and add to response
            // return status code 200
            return res.status(200).json({ result })
        }
   
            // if login fail return status code 400 
            return res.status(400).json("Login Failed")
        }

        // user does not exist
        return res.status(400).json("Login Failed")


    } catch (error) {
        console.log(error)
        return res.status(500).json("Something went wrong")
    }
}

export {
    login,
}