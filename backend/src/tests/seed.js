import db from '../config/db.js';
import { usersTable, gendersTable, rolesTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

let roles;
let genders;

const numOfUsers = 2;

const reset = async ()=>{
    await db.delete(usersTable)
    await db.delete(gendersTable)
    await db.delete(rolesTable)
}

const resetAndSeed = async () => {
    await reset();

    // clear/reset the table before test

    roles = await populateRolesTable();

    genders = await populateGendersTable();

    await db.insert(usersTable).values([
        { name: "Alice", email: "alice@test.com", password: "h@shedPassword1", rolesId: roles.student.id, genderId: genders.female.id, age: 25 },
        { name: "Bob", email: "bob@test.com", password: "h@shedPassword2", rolesId: roles.teacher.id, age: 30 },
    ]);
}

const populateRolesTable = async () =>{
    let res = await db.insert(rolesTable).values([
        { name: "ADMIN" },
        { name: "STUDENT" },
        { name: "TEACHER" }
    ]);


    res = await db.select().from(rolesTable)

    return {
        "admin": res[0],
        "student": res[1],
        "teacher": res[2]
    }
}

const populateGendersTable = async () =>{
    let res = await db.insert(gendersTable).values([
        { name: "MALE" },
        { name: "FEMALE" },
    ]);


    res = await db.select().from(gendersTable)

    return {
        "male": res[0],
        "female": res[1],
    }
}

const getGenders = () =>{
    return genders;
}

const getRoles = () =>{
    return roles;
}

export {
    resetAndSeed,
    numOfUsers,
    getRoles,
    getGenders
}