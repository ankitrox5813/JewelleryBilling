import express from "express";
import {
  createBill,
  getBill,
  getBillPDF,
  listBills,
  updateBill,
  searchBills,
} from "../controllers/bill.controller.js";

const router = express.Router();

/* 🔍 Search (must be BEFORE :id) */
router.get("/search", searchBills);

/* 📄 List & Create */
router.get("/", listBills);
router.post("/", createBill);

/* 📄 Single Bill */
router.get("/:id/pdf", getBillPDF);
router.get("/:id", getBill);

/* ✏️ Update Bill */
router.put("/:id", updateBill);

export default router;
