import express from "express"
import { body, query } from "express-validator";
import { getAllUsers, createUser, updateUser } from '../controllers/userControllers.js';

const router = express.Router();

router.get("/", getAllUsers);

router.post("/", createUser);

router.put("/:id",
    body('email').optional().trim().isEmail().escape(),
    body('password').optional().trim().isStrongPassword().escape(),
    body('name').optional().trim().isString().notEmpty().escape(),
    body('age').optional().isInt({ min: 0, max: 150, allow_leading_zeroes: false }).escape(),
    updateUser)

export default router;