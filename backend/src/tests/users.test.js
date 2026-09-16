import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { resetAndSeed, getGenders, getRoles } from './seed.js';
import { createRandomUser } from './factories/userFactory.js';
import { faker } from '@faker-js/faker';
import db from '../config/db.js';
import bcrypt from 'bcrypt';
import { eq } from "drizzle-orm";
import { usersTable } from '../db/schema.js';


let users;

// before each it block
beforeEach(async () => {
  users = await resetAndSeed();
})

// after each it block
afterEach(() => {
  vi.resetAllMocks();
})

const baseUserEndpoint = '/api/users'


describe('GET /users/', () => {
  beforeEach(async ()=>{
      users = await resetAndSeed()
  })

  it('returns status code 200 on successful retrieval', async () => {
    const res = await request(app).get(baseUserEndpoint);
    expect(res.status).toBe(200);
  });

  it('returns status code 500 when database fails', async () => {
    vi.spyOn(db, 'select').mockImplementation(() => {
      throw new Error("Simulated Database Failed To Retrieve Users Error");
    })

    const res = await request(app).get(baseUserEndpoint);
    expect(res.status).toBe(500);
  })

  it('returns all users retrieved', async () => {
    const res = await request(app).get(baseUserEndpoint);

    // reduce the genders to single object
    let genders = getGenders(true);

    // reduce role to single object
    let roles = getRoles(true);

    // get rid of password
    const cleanedUsers = users.reduce((accumulator, user)=>{
      accumulator.push(convertToMockUserResponseObject(user, genders, roles))
      return accumulator
    }, [])

    cleanedUsers.forEach(element => {
      const resUser = res.body.find((x)=> x.email == element.email)

      expect(resUser).toBeDefined()
      expect(resUser).toMatchObject(element)
    });
  })
});

describe('GET /users/:id', () => {
  let testUser;

  beforeEach(()=>{
    testUser = users[0]
  })

  it("returns status code 200 on successful retrieval", async () => {
    const getUserRes = await request(app).get(`${baseUserEndpoint}/${testUser.id}`)
    expect(getUserRes.status).toBe(200);
  })

  it("should return user in correct format", async () => {
    const getUserRes = await request(app).get(`${baseUserEndpoint}/${testUser.id}`)

    const genders = getGenders(true)
    const roles = getRoles(true)

    testUser = convertToMockUserResponseObject(testUser, genders, roles)

    expect(getUserRes.body.user).toMatchObject(testUser);
  })

  it('returns status code 500 when server fails', async () => {
    vi.spyOn(db, 'select').mockImplementation(() => {
      throw new Error("Simulated Database Failed To Select User Error");
    })

    const result = await request(app).get(`${baseUserEndpoint}/${testUser.id}`)
    expect(result.statusCode).toBe(500);
  })

  it('should return status code 400 on invalid id', async ()=>{
    const res = await request(app).get(`${baseUserEndpoint}/${'abc'}`)
    expect(res.status).toBe(400);
  })

  it('return status code 400 if user does not exist', async ()=>{
    const res = await request(app).get(`${baseUserEndpoint}/${0}`)

    const keywords = ['user', 'does', 'not' ,'exist' ]
    const message = res.body.toLowerCase()
    expect(keywords.every(word => message.includes(word))).toBe(true);
    expect(res.statusCode).toBe(400);
  })
})

describe('POST /users/', () => {
  let payload;

  beforeEach(async ()=>{
    await db.delete(usersTable)

    // payload = {name: 'marcus', email: 'test.test@gmail.com', age: 32, password: 'StrongP@ssword1', rolesId: String(Object.keys(getRoles(true))[0])}
    payload = createRandomUser()
  })

  it('returns status code 200 on successful creation', async () => {
    const res = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    expect(res.status).toBe(200);
  })

  it('new user should exist in the table', async () => {

    payload.email = "fixedTestEmail@email.com"
    const res = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    const userId = res.body.id;

      // retrieve from database directly
      const retrieveUserResult = await db.select({
        email: usersTable.email,
        password: usersTable.password,
        age: usersTable.age,
        rolesId: usersTable.rolesId,
        genderId: usersTable.genderId,
      }).from(usersTable).where(eq(usersTable.id, userId)).limit(1)

      const insertedUser = retrieveUserResult[0]

      // verify data inserted is correct
      expect(insertedUser.email).toBe(payload.email)
      expect(await bcrypt.compare(payload.password, insertedUser.password)).toBe(true)
      expect(insertedUser.age).toBe(payload.age)
      expect(insertedUser.rolesId).toBe(payload.rolesId)

      if(!payload.genderId) 
        expect(insertedUser.genderId).toBe(null)
      else 
        expect(insertedUser.genderId).toBe(payload.genderId)
      

  })

  it('returns status code 409 if user already exists', async () => {
    // insert new user first
    const insertedUser = await db.insert(usersTable).values(payload).returning()

    // check insertion was successful
    expect(insertedUser).toHaveLength(1)
    expect(insertedUser[0]).toMatchObject({ email: payload.email });

    const res = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    expect(res.statusCode).toEqual(409);
  })

  // password does not meet strength requirements
  it('returns status code 400 and error message if user password failed to meet strength requirement', async () => {
    payload.password = "weakpassword"

    const res = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    // check status code
    expect(res.status).toEqual(400);

    // check error message included
    expect(res.body).toHaveProperty("errors")
    expect(res.body.errors).toContain("body[password]: Password is not strong enough.")
  })

  // password is empty
  it('returns status code 400 and error message if user password is empty', async () => {

    payload.password = ""

    const res = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    // check status code
    expect(res.status).toEqual(400);

    // check error message included
    expect(res.body).toHaveProperty("errors")
    expect(res.body.errors).toContain("body[password]: Password is empty.")
  })

  // wrong email format
  it('returns status code 400 and error message if user email is not valid format', async () => {

    payload.email = "test.com"

    const res = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    // check status code
    expect(res.status).toEqual(400);

    // check error message included
    expect(res.body).toHaveProperty("errors")
    expect(res.body.errors).toContain("body[email]: Invalid email format.")
  })

  // email is empty
  it('returns status code 400 and error message if user email is empty', async () => {

    payload.email = ""

    const res = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    // check status code
    expect(res.status).toEqual(400);

    // check error message included
    expect(res.body).toHaveProperty("errors")
    expect(res.body.errors).toContain("body[email]: Email is empty.")
  })

  // invalid age
  it('returns status code 400 and error message if user age is not valid', async () => {

    payload.age = -2

    const res = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    // check status code
    expect(res.status).toEqual(400);

    // check error message included
    expect(res.body).toHaveProperty("errors")
    expect(res.body.errors).toContain("body[age]: Age must be a valid integer.")
  })

  // empty name
  it('returns status code 400 and error message if user name is empty', async () => {

    payload.name = ""

    const res = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    // check status code
    expect(res.status).toEqual(400);

    // check error message included
    expect(res.body).toHaveProperty("errors")
    expect(res.body.errors).toContain("body[name]: Name is empty.")
  })

  it('returns status code 400 and error message if gender id is not valid', async () => {
    payload.genderId = -1

    const res = await request(app)
    .post(baseUserEndpoint)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(payload)

    // check status code
    expect(res.status).toEqual(400);

    // check error message included
    expect(res.body).toHaveProperty("errors")
    expect(res.body.errors).toContain("body[genderId]: Id is invalid.")
  })

  it('returns status code 400 and error message if roles id is not valid', async () => {
    payload.rolesId = -1

    const res = await request(app)
    .post(baseUserEndpoint)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(payload)

    expect(res.statusCode).toBe(400)

    const message = res.body

    // verify error message for invalid id exists
    expect(message).toHaveProperty("errors")
    expect(message.errors).toContain("body[rolesId]: Id is invalid.")
  })

  // check if password is hashed
  it('password should not be stored in plaintext and should be hashed', async () => {

    const result = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    expect(result.statusCode).toBe(200)

    const user = await db.select({ password: usersTable.password }).from(usersTable).where(eq(usersTable.email, payload.email));

    const savedPassword = user[0].password;

    // ensure it's not stored as plaintext, just for easier diagnosis because a failure on bcrypt compare could mean anything.
    expect(payload.password).not.toBe(savedPassword);

    // check if the password was hashed.
    expect(await bcrypt.compare(payload.password, savedPassword)).toBe(true);
  })

  it('returns status code 500 when server fails', async () => {
    vi.spyOn(db, 'insert').mockImplementation(() => {
      throw new Error("Simulated Database Failed To Insert User Error");
    })

    const result = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    expect(result.status).toBe(500);
  })
})

describe('PUT /users/:id', () => {
  let user;
  beforeEach(async () => {
    user = users[0]
  })

//#region validation
  // returns status code 400 on validation errors
  it('handles age validation error', async () => {
    const payload = { "age": "a" }
    const res = await request(app)
      .put(`${baseUserEndpoint}/${user.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors")
      expect(res.body.errors).toContain('body[age]: Age must be a valid integer.')
  });

  // returns status code 400 on validation errors
  it('handles email validation error', async () => {
    const payload = { "email": "aa.com" }
    const res = await request(app)
      .put(`${baseUserEndpoint}/${user.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors')
      expect(res.body.errors).toContain("body[email]: Invalid email format.")
  });

  // returns status code 400 on validation errors
  it('handles password validation error', async () => {
    const payload = { "password": "password" }
    const res = await request(app)
      .put(`${baseUserEndpoint}/${user.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors')
      expect(res.body.errors).toContain("body[password]: Password is not strong enough.")
  });

  // returns status code 400 on validation errors
  it('handles gender validation error', async () => {
    const payload = { "genderId": -1 }
    const res = await request(app)
      .put(`${baseUserEndpoint}/${user.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors')
      expect(res.body.errors).toContain("body[genderId]: Id is invalid.")
  });

  // returns status code 400 on validation errors
  it('handles role validation error', async () => {
    const payload = { "rolesId": -1 }
    const res = await request(app)
      .put(`${baseUserEndpoint}/${user.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors')
      expect(res.body.errors).toContain("body[rolesId]: Id is invalid.")
  });
//#endregion
  
  // returns status 404 if user was not found
  it('returns status 404 if user was not found', async () => {
    const payload = { "name": "marcus" }
    const res = await request(app)
      .put(`${baseUserEndpoint}/0`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toBe("User not found.")
  });

  // returns status 200 if user was found
  it('returns status 200 if user was found', async () => {
    const payload = { name: 'Marcus' }
    const res = await request(app)
      .put(`${baseUserEndpoint}/${user.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);
    expect(res.status).toBe(200);
  });
  
  // // check if fields are updated
  // it('check if fields are updated', async () => {
  //   const payload = createRandomUser()
  //   const res = await request(app)
  //     .put(`${baseUserEndpoint}/${user.id}`)
  //     .set('Content-Type', 'application/json')
  //     .set('Accept', 'application/json')
  //     .send(payload);

  //   expect(res.status).toBe(200);

  //   // check updates took place
  //   const updatedUserRetrievalRes = await db.select().from(usersTable).where(eq(usersTable.id, user.id))
    
  //   const user = updatedUserRetrievalRes[0]
  //   expect(user.age).toBe(payload.age)
  //   expect(user.email).toBe(payload.email)
  //   expect(user.name).toBe(payload.name)

  //   // need to check if the updatedAt field is also updated

  //   // check if password is rehashed
  //   expect(await bcrypt.compare(payload.password, user.password)).toBe(true)
  // });

  // // ensure correct fields are only updated
  // it('ensure correct fields are only updated', async () => {
  //   // retrieve original user data
  //   const originalRes = await db.select().from(usersTable).where(eq(usersTable.id, userId))

  //   const originalUserData = originalRes[0]

  //   const payload = { 'name': 'Marcus' }
  //   const res = await request(app)
  //     .put(`${baseUserEndpoint}/${userId}`)
  //     .set('Content-Type', 'application/json')
  //     .set('Accept', 'application/json')
  //     .send(payload);

  //   expect(res.status).toBe(200);

  //   // check updates took place
  //   const updatedUserRetrievalRes = await db.select({
  //     'name': usersTable.name,
  //     'password': usersTable.password,
  //     'age': usersTable.age,
  //     'email': usersTable.email
  //   }).from(usersTable).where(eq(usersTable.id, userId))


  //   const user = updatedUserRetrievalRes[0]
  //   expect(user.age).toBe(originalUserData.age)
  //   expect(user.email).toBe(originalUserData.email)
  //   expect(user.name).toBe(payload.name)
  //   expect(user.password).toBe(originalUserData.password)
  // });
});

// describe('DELETE /users/:id', () => {
//   let userId;
//   beforeEach(async () =>{
//     userId = await createTestUser();
//   })

//   // return status 200 on successful delete
//   it('return status 200 on successful delete', async ()=>{
//     const res = await request(app).delete(`${baseUserEndpoint}/${userId}`);

//     expect(res.status).toBe(200);

//     // ensure user deleted from database
//     const attemptRes = await db.select().from(usersTable).where(eq(usersTable.id, userId))

//     expect(attemptRes.length).toBe(0)
//   })

//   // return status 404 if user not found
//   it('return status 404 if user not found', async ()=>{
//     const res = await request(app).delete(`${baseUserEndpoint}/0`);

//     expect(res.status).toBe(404);
//   })

//   // return status 400 if id validation failed
//   it('return status 400 if id validation failed', async ()=>{
//     const res = await request(app).delete(`${baseUserEndpoint}/a`);

//     expect(res.status).toBe(400);
//   })

//   // expect status 500 if database failure
//   it('expect status 500 if database failure', async ()=>{
//     vi.spyOn(db, 'delete').mockImplementation(()=>{
//       return new Error("Simulated Database Failed To Delete User Error")
//     })

//     const res = await request(app).delete(`${baseUserEndpoint}/${userId}`);

//     expect(res.status).toBe(500);
//   })

// })



// default argument is an empty object
// the destructure will default to values if they dont exist in an object

const convertToMockUserResponseObject = (user, genders, roles) => {
      // keep id, name, age, email, gender, role, createdAt, updatedAt
      delete user.password

      // rename genderId and roleId keys to gender and role
      const { genderId: gender, rolesId: role } = user

      delete user.genderId
      delete user.rolesId

      // use id with the names
      user['gender'] = genders[gender] == undefined ? null : genders[gender]
      user['role'] = roles[role]

      // convert to string since the response is in string instead of date
      user['createdAt'] = user.createdAt.toISOString()
      user['updatedAt'] = user.updatedAt.toISOString()

      return user
}