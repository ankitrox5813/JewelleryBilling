import express from "express";
import { addRate, getTodayRates } from "../controllers/rate.controller.js";

const router = express.Router();
router.post("/", addRate);
router.get("/today", getTodayRates);

export default router;
