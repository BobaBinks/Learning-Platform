import db from "../config/db.js";
import { usersTable, gendersTable, rolesTable } from "../db/schema.js";

const popDb = async () => {
    try {
        // let res = await db.update(usersTable).set({rolesId: 2})
    } catch (error) {
        console.log(error);
    }
}

popDb();