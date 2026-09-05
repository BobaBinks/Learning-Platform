import express from "express"
import { body, query } from "express-validator";
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userControllers.js';
import { emailValidationChain, passwordValidationChain, nameValidationChain, ageValidationChain, idValidationChain } from "../utils/validationChains.js";


const router = express.Router();

router.get("/", getAllUsers);

router.post("/",
    emailValidationChain(),
    passwordValidationChain(),
    ageValidationChain(),
    nameValidationChain(), 
    passwordValidationChain(),
    createUser);

router.put("/:id",
    emailValidationChain({ isOptional: true }),
    passwordValidationChain({ isOptional: true }),
    ageValidationChain({ isOptional: true }),
    nameValidationChain({ isOptional: true }),
    updateUser);

router.delete("/:id", idValidationChain(), deleteUser);

export default router;