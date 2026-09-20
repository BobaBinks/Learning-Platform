
import authMiddleware from '../middleware/authMiddleware';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import jwt from 'jsonwebtoken'
import db from '../config/db.js';

afterEach(() => {
    vi.resetAllMocks()
})

describe('JWT Verification Middleware', () => {
    it('returns status code 401 if token is invalid or missing', () => {
        const req = { cookies: {} }
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        }
        const next = vi.fn()

        authMiddleware.verifyToken(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith("Invalid token.")
        expect(next).not.toHaveBeenCalled()
    });

    it('calls next() if token is valid', () => {
        const token = jwt.sign({
            id: 1
        }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })

        const req = { cookies: { jwt: token } }
        const res = vi.fn()
        const next = vi.fn()

        authMiddleware.verifyToken(req, res, next)

        expect(next).toHaveBeenCalled()
    });

    it('sets decoded token on the request if token is valid', () => {
        const token = jwt.sign({
            id: 1
        }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })

        const req = { cookies: { jwt: token } }
        const res = vi.fn()
        const next = vi.fn()

        authMiddleware.verifyToken(req, res, next)

        expect(req).toHaveProperty('decoded')
        expect(req.decoded).toEqual(jwt.decode(token))
    });
})