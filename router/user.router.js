import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  login,
} from "../controller/user.controller.js";
import {
  authMiddleware,
  autherizationMiddleware,
} from "../middlewares/auth.middlewares.js";

const router = express.Router();

// POST /muser
router.post(
  "/muser",
  authMiddleware,
  autherizationMiddleware(["admin"]),
  createUser
);
router.get("/musers", authMiddleware, getAllUsers);
router.get("/muser/:id", authMiddleware, getUserById);
router.post("/mlogin", login);
export default router;
