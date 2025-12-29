import express from "express";
import { createBill, getBill, getBillPDF, listBills } from "../controllers/bill.controller.js";

const router = express.Router();
router.post("/", createBill);
router.get("/:id", getBill);
router.get("/:id/pdf", getBillPDF);
router.get("/", listBills);


export default router;
