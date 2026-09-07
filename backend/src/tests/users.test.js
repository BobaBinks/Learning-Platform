import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { resetAndSeed, numOfUsers } from './seed.js';

beforeEach(async () => {
  await resetAndSeed();
})

describe('GET /users/', () => {
  it('returns status code 200 on successful retrieval', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
  });

  it('returns all users retrieved', async () => {
    const res = await request(app).get('/api/users');
    console.log("RES BODY: ", res.body);
    expect(res.body).toHaveLength(numOfUsers);
  })
});



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

