import { faker } from "@faker-js/faker";
import { getRoles, getGenders } from "../seed.js";

const createRandomUser = () => {
    // { female: {id: 5, name: female}}
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


    const user = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        age: faker.number.int({min: 0, max: 150}),
        password: faker.internet.password(),
        rolesId: faker.helpers.arrayElement(roles),
        genderId: faker.helpers.maybe(() => faker.helpers.arrayElement(genders))
    }

    return user
}

export {
    createRandomUser
}