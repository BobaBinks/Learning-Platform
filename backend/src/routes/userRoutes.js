import express from "express"
import { body, query } from "express-validator";
import { getAllUsers, createUser, updateUser, deleteUser, getUser } from '../controllers/userControllers.js';
import { emailValidationChain, passwordValidationChain, nameValidationChain, ageValidationChain, idParamValidationChain,idBodyValidationChain } from "../utils/validationChains.js";


const router = express.Router();

router.get("/", getAllUsers);

router.get("/:id",idParamValidationChain(), getUser);

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
    idParamValidationChain(),
    nameValidationChain({ isOptional: true }),
    emailValidationChain({ isOptional: true }),
    passwordValidationChain({ isOptional: true }),
    ageValidationChain({ isOptional: true }),
    idBodyValidationChain({fieldname: "rolesId", isOptional: true}),
    idBodyValidationChain({fieldname: "genderId", isOptional: true}),
    updateUser);

router.delete("/:id", idParamValidationChain(), deleteUser);

export default router;