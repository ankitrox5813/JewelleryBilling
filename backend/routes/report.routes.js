import express from "express";
import { dailyReport } from "../controllers/report.controller.js";

const router = express.Router();
router.get("/daily", dailyReport);
export default router;
