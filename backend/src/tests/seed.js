import db from '../config/db.js';
import { usersTable, gendersTable, rolesTable } from '../db/schema.js';
import { createRandomUser } from './factories/userFactory.js';
import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';

let roles;
let genders;

const reset = async ()=>{
    await db.delete(usersTable)
    await db.delete(gendersTable)
    await db.delete(rolesTable)
}

const resetAndSeed = async (numOfUsers = 2) => {
    await reset();

    // clear/reset the table before test

    roles = await populateRolesTable();

    genders = await populateGendersTable();

    const res = await db.insert(usersTable).values(faker.helpers.multiple(createRandomUser, { count: numOfUsers})).returning()

    return res;
}

const populateRolesTable = async () =>{
    let res = await db.insert(rolesTable).values([
        { name: "ADMIN" },
        { name: "STUDENT" },
        { name: "TEACHER" }
    ]);


    res = await db.select().from(rolesTable)

    return res
}

const populateGendersTable = async () =>{
    let res = await db.insert(gendersTable).values([
        { name: "MALE" },
        { name: "FEMALE" },
    ]);


    res = await db.select().from(gendersTable)

    return res
}

const getGenders = (reduce = false) => {
    if (reduce) {
        return genders.reduce((accumulator, genderElement) => {
            accumulator[genderElement.id] = genderElement.name
            return accumulator
        }, {})
    }

    return genders
}

const getRoles = (reduce = false) => {
    if (reduce) {
        return roles.reduce((accumulator, roleElement) => {
            accumulator[roleElement.id] = roleElement.name
            return accumulator
        }, {})
    }
    return roles;
}


export {
    resetAndSeed,
    getRoles,
    getGenders,
}