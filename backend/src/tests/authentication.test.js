import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { resetTestDatabase, seedUsersTable } from './seed.js';
import db from '../config/db.js';
import bcrypt from 'bcrypt';
import { eq } from "drizzle-orm";
import { usersTable, rolesTable, gendersTable } from '../db/schema.js';
import jwt from 'jsonwebtoken'
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { log } from 'console';

const baseAuthenticationEndpoint = '/api/auth'
const loginEndpoint = `${baseAuthenticationEndpoint}/login`
const logoutEndpoint = `${baseAuthenticationEndpoint}/logout`
const loggedInUserEndpoint = `${baseAuthenticationEndpoint}/loggedInUser`

let users;
let numOfUsersToSeed = 2

beforeEach(async () => {
    await resetTestDatabase()
    users = await seedUsersTable(numOfUsersToSeed)
})

afterEach(async () => {
    vi.resetAllMocks();
})

describe('POST /auth/login', () => {
    let user;
    let payload;

    beforeEach(() => {
        user = users[0]
        
        payload = {
            email: user.email,
            password: user.password
        }
    })

    it('should return status code 200 and jwt token on successful login', async () => {
        vi.spyOn(bcrypt, 'compare').mockImplementation(() => {
            return true;
        })

        const res = await request(app).post(loginEndpoint).send(payload)

        expect(res.statusCode).toBe(200)
        expect(res.header).toHaveProperty('set-cookie')

        const jwtRe = /^jwt=/
        const cookie = extractCookie(res, jwtRe)
        
        let splitStr = cookie.split(';')
        splitStr = splitStr.reduce((accumulator, element) => {
           accumulator.push(element.trim())
            return accumulator
        }, [])

        const tokenStr = splitStr.find((element) => { return jwtRe.test(element) })
        expect(tokenStr).toBeDefined()

        const token = tokenStr.split('=')[1]

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)

        expect(decodedToken).toHaveProperty('id')
        expect(decodedToken.id).toBe(user.id)

        // test token expiration is after issued at
        expect(decodedToken.exp).toBeGreaterThan(decodedToken.iat)
        
        expect(splitStr).toContain('HttpOnly')
    })

    it('should return status code 500 on server failure', async () => {
        vi.spyOn(db, 'select').mockImplementation(() => {
            throw new Error("Simulated Database Failed To Retrieve User Error");
        })

        const result = await request(app).post(loginEndpoint).send(payload)

        expect(result.statusCode).toBe(500)
        expect(result.body).toBe("Something went wrong")
    })

    it('should return status code 400 and error message on password validation failure', async () => {
        payload.password = "pass"

        const result = await request(app).post(loginEndpoint).send(payload)

        expect(result.statusCode).toBe(400)
        expect(result.body).toHaveProperty("errors")
        expect(result.body.errors).toContain('body[password]: Password is not strong enough.')
    })

    it('should return status code 400 and error message on email validation failure', async () => {
        payload.email = "email"

        const result = await request(app).post(loginEndpoint).send(payload)

        expect(result.statusCode).toBe(400)
        expect(result.body).toHaveProperty("errors")
        expect(result.body.errors).toContain('body[email]: Invalid email format.')
    })

    it('should return status code 400 and failure message if user not found', async () => {
        const deletedUserResult = await db.delete(usersTable)
        .where(eq(usersTable.id, user.id))
        .returning({id: usersTable.id})

        expect(deletedUserResult).toContainEqual({ id: user.id })

        const result = await request(app).post(loginEndpoint).send(payload)

        expect(result.statusCode).toBe(400)
        expect(result.body).toBe("Login Failed")
    })

    it('should return status code 400 and failure message when password does not match', async () => {
        payload.password = `${payload.password}1`

        const result = await request(app).post(loginEndpoint).send(payload)

        expect(result.statusCode).toBe(400)
        expect(result.body).toBe("Login Failed")
    })
})

describe('GET /auth/logout', () => {
    it('should call clearCookies', async () => {
        const clearCookie = vi.spyOn(express.response, 'clearCookie')

        await request(app).get(logoutEndpoint)

        expect(clearCookie).toHaveBeenCalled()
        expect(clearCookie).toHaveBeenCalledWith('jwt')
    })

    it('should return status code 200', async () => {
        const res = await request(app).get(logoutEndpoint)

        expect(res.status).toBe(200)
        expect(res.body).toBe('Logged out')
    })
})

describe('GET /auth/loggedInUser', () => {
    it('return status code 200 public user data if user in token was found in database', async () => {
        
        vi.spyOn(authMiddleware, 'verifyToken').mockImplementation((req, res, next) => {
            req.decoded = {
                id: users[0].id
            }
            return next()
        })

        const res = await request(app).get(loggedInUserEndpoint)

        let retrieveUserResult = await db.select({
                id: usersTable.id,
                name: usersTable.name,
                email: usersTable.email,
                age: usersTable.age,
                role: rolesTable.name,
                gender: gendersTable.name,
                createdAt: usersTable.createdAt,
                updatedAt: usersTable.updatedAt
            }).from(usersTable)
                .where(eq(usersTable.id, users[0].id))
                .leftJoin(rolesTable, eq(usersTable.rolesId, rolesTable.id))
                .leftJoin(gendersTable, eq(usersTable.genderId, gendersTable.id))
        
        expect(res.status).toBe(200)
        
        retrieveUserResult = retrieveUserResult[0]
        retrieveUserResult.createdAt = retrieveUserResult.createdAt.toJSON()
        retrieveUserResult.updatedAt = retrieveUserResult.updatedAt.toJSON()

        expect(res.body).toMatchObject(retrieveUserResult)
        
    })

    it('return status code 404 and message if decoded token was not provided in request', async () => {
        vi.spyOn(authMiddleware, 'verifyToken').mockImplementation((req, res, next) => {
            next()
        })

        const res = await request(app).get(loggedInUserEndpoint)
        expect(res.status).toBe(404)
        expect(res.body).toBe('Token not found')
    })

    it('returns status code 500 on database failure', async () => {
        vi.spyOn(db, 'select').mockImplementation(() => {
            throw new Error("Simulating database error")
        })

        vi.spyOn(authMiddleware, 'verifyToken').mockImplementation((req, res, next) => {
            req.decoded = {
                id: users[0].id
            }
            next()
        })

        const res = await request(app).get(loggedInUserEndpoint)

        expect(res.status).toBe(500)
        expect(res.body).toBe("Something went wrong.")
    })

    it('returns status code 404 and message if user not found', async () => {
        vi.spyOn(authMiddleware, 'verifyToken').mockImplementation((req, res, next) => {
            const invalidId = 0
            req.decoded = {
                id: invalidId
            }
            next()
        })

        const res = await request(app).get(loggedInUserEndpoint)

        expect(res.status).toBe(404)
        expect(res.body).toBe("User not found")
    })
})

/** 
 * Extracts cookie from response header property 'set-cookie' using regex
 * Returns undefined if no match was found or an error occured
 */
const extractCookie = (res, regex) => {
    // find jwt token string using the find function and regex
    // should match pattern 'jwt=' as the first 4 characters

    // then return string
    const cookieObject = res.header['set-cookie']
    return cookieObject.find((element) => {
        return regex.test(element)
    })
}