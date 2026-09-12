import db from "../config/db.js";
import { usersTable, gendersTable, rolesTable } from "../db/schema.js";

const popDb = async () => {
    try {
        let res = await db.insert(gendersTable).values([
            { name: "MALE"},
            { name: "FEMALE"}
        ])

        res = await db.insert(rolesTable).values([
            {name: "ADMIN"},
            {name: "STUDENT"},
            {name: "TEACHER"}
        ])
    } catch (error) {
        console.log(error);
    }
}

popDb();