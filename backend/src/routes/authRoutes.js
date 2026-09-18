import express from "express"
import { body, query } from "express-validator";
import { login } from "../controllers/authController.js";
import { emailValidationChain, passwordValidationChain, nameValidationChain, ageValidationChain, idParamValidationChain,idBodyValidationChain } from "../utils/validationChains.js";

const router = express.Router()

router.post('/login',
    emailValidationChain(),
    passwordValidationChain(),
    login)

export default router;