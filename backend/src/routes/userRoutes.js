import express from "express"
import { getAllUsers, createUser, updateUser } from '../controllers/userControllers.js';

const router = express.Router();

router.get("/", getAllUsers);

router.post("/", createUser);

router.put("/:id", updateUser)

export default router;