import db from '../config/db.js';
import { usersTable, gendersTable, rolesTable } from '../db/schema.js';
import { createRandomUser } from './factories/userFactory.js';
import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';

let roles;
let genders;

const resetTestDatabase = async () => {
    await db.delete(usersTable)
    await db.delete(rolesTable)
    await db.delete(gendersTable)
}

const seedUsersTable = async (numOfUsers = 2) => {
    roles = await seedRolesTable();

    genders = await seedGendersTable();

    const res = await db.insert(usersTable).values(faker.helpers.multiple(createRandomUser, { count: numOfUsers})).returning()

    return res;
}

const seedRolesTable = async () =>{
    let res = await db.insert(rolesTable).values([
        { name: "ADMIN" },
        { name: "STUDENT" },
        { name: "TEACHER" }
    ]);


    res = await db.select().from(rolesTable)

    return res
}

const seedGendersTable = async () =>{
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
    seedUsersTable,
    resetTestDatabase,
    getRoles,
    getGenders,
}