import db from '../config/db.js';
import { usersTable } from '../db/schema.js';


const numOfUsers = 2;
const resetAndSeed = async () => {
    // clear/reset the table before test
    await db.delete(usersTable);
    await db.insert(usersTable).values([
        { name: "Alice", email: "alice@test.com", password: "password1", age: 25 },
        { name: "Bob", email: "bob@test.com", password: "password2", age: 30 },
    ]);
}




export {
    resetAndSeed,
    numOfUsers,
}