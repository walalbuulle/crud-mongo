import express from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders,
} from "../controller/customerController.js";
import { authMiddleware, autherizationMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Customer CRUD operations
router.post("/", autherizationMiddleware(["admin"]), createCustomer);
router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", autherizationMiddleware(["admin"]), updateCustomer);
router.delete("/:id", autherizationMiddleware(["admin"]), deleteCustomer);

// Customer specific routes
router.get("/:id/orders", getCustomerOrders);

export default router;