import express from "express";
import {
  createGoldLoan,
  addGoldLoanPayment,
  getGoldLoanDetails,
  closeGoldLoan,
} from "../controllers/goldLoan.controller.js";

const router = express.Router();

router.post("/", createGoldLoan);
router.get("/:id", getGoldLoanDetails);
router.post("/:id/payments", addGoldLoanPayment);
router.post("/:id/close", closeGoldLoan);

export default router;
