import express from "express"
import { body, query } from "express-validator";
import { getAllUsers, createUser, updateUser, deleteUser, getUser } from '../controllers/userControllers.js';
import { emailValidationChain, passwordValidationChain, nameValidationChain, ageValidationChain, idParamValidationChain,idBodyValidationChain } from "../utils/validationChains.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", 
    (req, res, next) => authMiddleware.verifyToken(req, res, next), 
    getAllUsers);

router.get("/:id",
    (req, res, next) => authMiddleware.verifyToken(req, res, next),
    idParamValidationChain(), getUser);

router.post("/",
    emailValidationChain(),
    passwordValidationChain(),
    ageValidationChain(),
    nameValidationChain(), 
    passwordValidationChain(),
    idBodyValidationChain({fieldname: "rolesId"}),
    idBodyValidationChain({fieldname: "genderId", isOptional: true}),
    createUser);

router.put("/:id",
    (req, res, next) => authMiddleware.verifyToken(req, res, next),
    idParamValidationChain(),
    nameValidationChain({ isOptional: true }),
    emailValidationChain({ isOptional: true }),
    passwordValidationChain({ isOptional: true }),
    ageValidationChain({ isOptional: true }),
    idBodyValidationChain({fieldname: "rolesId", isOptional: true}),
    idBodyValidationChain({fieldname: "genderId", isOptional: true}),
    updateUser);

router.delete("/:id", 
    (req, res, next) => authMiddleware.verifyToken(req, res, next),
    idParamValidationChain(), 
    deleteUser);

export default router;