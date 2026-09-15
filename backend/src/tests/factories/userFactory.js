import { faker } from "@faker-js/faker";
import { getRoles, getGenders } from "../seed.js";

const createRandomUser = () => {
    let roles = getRoles();
    let genders = getGenders();

    roles = roles.reduce((accumulator, element) => {
        accumulator.push(element.id)
        return accumulator
    }, [])

    genders = genders.reduce((accumulator, element) => {
        accumulator.push(element.id)
        return accumulator
    }, [])


    let user = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        age: faker.number.int({min: 0, max: 150}),
        password: "StrongP@ssword101",
        rolesId: faker.helpers.arrayElement(roles),
    }
    
    const gender = faker.helpers.maybe(() => faker.helpers.arrayElement(genders), {probability: 0.5}) ?? null
    if(gender)
        user['genderId'] = gender;

    return user
}

export {
    createRandomUser
}