import express from "express";
import {
  createCustomer,
  searchCustomer,
  customerSummary,
  listCustomers,
  getCustomerProfile,
} from "../controllers/customer.controller.js";

const router = express.Router();

router.post("/", createCustomer);
router.get("/search", searchCustomer);
router.get("/:id/summary", customerSummary);
router.get("/:id", getCustomerProfile);
router.get("/", listCustomers);

export default router;
