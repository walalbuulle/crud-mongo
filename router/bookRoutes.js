import express from "express";
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controller/bookController.js";
import { authMiddleware, autherizationMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// All routes are admin-only
router.post("/", autherizationMiddleware(["admin"]), createBook);
router.get("/", autherizationMiddleware(["admin"]), getAllBooks);
router.get("/:id", autherizationMiddleware(["admin"]), getBookById);
router.put("/:id", autherizationMiddleware(["admin"]), updateBook);
router.delete("/:id", autherizationMiddleware(["admin"]), deleteBook);

export default router;