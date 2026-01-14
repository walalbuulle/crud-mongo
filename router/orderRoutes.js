import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controller/orderController.js";
import { authMiddleware, autherizationMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// All routes are admin-only
router.post("/", autherizationMiddleware(["admin"]), createOrder);
router.get("/", autherizationMiddleware(["admin"]), getAllOrders);
router.get("/:id", autherizationMiddleware(["admin"]), getOrderById);
router.patch("/:id/status", autherizationMiddleware(["admin"]), updateOrderStatus);

export default router;