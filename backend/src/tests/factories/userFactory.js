import { faker } from "@faker-js/faker";
import { getRoles, getGenders } from "../seed.js";

const createRandomUser = () => {
    // { female: {id: 5, name: female}}
    // need to extract the ids
    // brute force method would be to extract the values

    // create a new array with just the values.id
    const roles = Object.values(getRoles());
    console.log("Roles: ", roles)


    const roleIds = Object.keys(getRoles());

    // {id, name}
    const genderIds = Object.keys(getGenders())
    return {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        age: faker.number.int({min: 0, max: 150}),
        password: faker.internet.password(),
        rolesId: faker.helpers.arrayElement(roleIds),
        genderId: faker.helpers.maybe(() => faker.helpers.arrayElement(genderIds))
    }
}

export {
    createRandomUser
}