import express from "express";
import { createCustomer, searchCustomer, customerSummary } from "../controllers/customer.controller.js";

const router = express.Router();
router.post("/", createCustomer);
router.get("/search", searchCustomer);
router.get("/:id/summary", customerSummary);


export default router;
