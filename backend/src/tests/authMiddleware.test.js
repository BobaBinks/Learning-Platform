import { request } from 'supertest'
import { verifyToken } from '../middleware/authMiddleware.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('JWT Verification Middleware', () => {
    it('return status code 401 if token is invalid or missing', () => {

    })

    it('calls next() if token is valid', () => {
        
    })
})