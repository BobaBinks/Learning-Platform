import express from "express"
import { login, loggedInUser, logout } from "../controllers/authController.js";
import { emailValidationChain, passwordValidationChain, nameValidationChain, ageValidationChain, idParamValidationChain,idBodyValidationChain } from "../utils/validationChains.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router()

router.post('/login',
    emailValidationChain(),
    passwordValidationChain(),
    login)

router.get('/loggedInUser',
    (req, res, next) => authMiddleware.verifyToken(req, res, next),
    loggedInUser)

router.get('/logout', logout)

export default router;