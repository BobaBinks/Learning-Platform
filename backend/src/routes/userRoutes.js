import express from "express"
import { body, query } from "express-validator";
import { getAllUsers, createUser, updateUser } from '../controllers/userControllers.js';
import { emailValidationChain, passwordValidationChain } from "../utils/validationChains.js";


const router = express.Router();

router.get("/", getAllUsers);

router.post("/", createUser);

router.put("/:id",
    emailValidationChain(true),
    passwordValidationChain(true),
    body('name').optional().notEmpty().trim().isString().escape(),
    body('age').optional().isInt({ min: 0, max: 150, allow_leading_zeroes: false }).escape(),
    updateUser)

export default router;