import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { resetAndSeed, numOfUsers } from './seed.js';
import db from '../config/db.js';

beforeEach(async () => {
  await resetAndSeed();
})

afterEach(() => {
  vi.resetAllMocks();
})

const baseUserEndpoint = '/api/users'

describe('GET /users/', () => {
  it('returns status code 200 on successful retrieval', async () => {
    const res = await request(app).get(baseUserEndpoint);
    expect(res.status).toBe(200);
  });

  it('returns status code 500 when database fails', async () => {
    vi.spyOn(db, 'select').mockImplementation(() => {
      throw new Error("Simulated Database Error");
    })

    const res = await request(app).get(baseUserEndpoint);
    expect(res.status).toBe(500);
  })

  it('returns all users retrieved', async () => {
    const res = await request(app).get(baseUserEndpoint);
    expect(res.body).toHaveLength(numOfUsers);

    // extract the id so its not included in the test.
    // as the id auto increments and does not reset in the database when cleared,
    // so its impossible to have a fixed id for testing.

    // destructuring and usage of rest operator to separate rest of data and id
    const { id: id1, ...user1 } = res.body[0];
    expect(user1).toEqual({ name: "Alice", email: "alice@test.com", age: 25 });


    const { id: id2, ...user2 } = res.body[1];
    expect(user2).toEqual({ name: "Bob", email: "bob@test.com", age: 30 });
  })
});

describe('POST /users/', () => {
  it('returns status code 200 on successful creation', async () => {
    const payload = { name: "Jane", email: "Jane@test.com", password: "h@shedPassword3", age: 16 };
    const res = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    expect(res.status).toEqual(200);
  })

  it('returns status code 409 if user already exists', async () => {
    const payload = { name: "Bob", email: "bob@test.com", password: "h@shedPassword2", age: 30 };
    const res = await request(app)
      .post(baseUserEndpoint)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(payload);

    expect(res.status).toEqual(409);
  })


  // it('returns status code 400 if user gave invalid credentials)
  // not strong password
  // wrong email format
  // invalid age
  // name

})

// describe('GET /users/', ()=>{
//   it("returns status code 200 on successful retrieval", async ()=>{
//     // create a new user, and save the returned id.

//     // make a get request using the id.
//     expect(1).toEqual(1);
//   })
// })

// describe('PUT /users/:id', () => {
//   it('updates a user and returns 200', async () => {
//     const res = await request(app).put('/api/users/1').send({ name: 'Marcus' });
//     expect(res.status).toBe(200);
//   });

//   // it('user name should be updated correctly.', async () => {
//   //   const res = await request(app).get('/api/users/1');

//   //   console.log("Result: ", res);
//   //   expect(res.status).toBe(200);
//   // });
// });

