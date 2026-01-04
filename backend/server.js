import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import rateRoutes from "./routes/rate.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import billRoutes from "./routes/bill.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reportRoutes from "./routes/report.routes.js";
import goldLoanRoutes from "./routes/goldLoan.routes.js";




dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rates", rateRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/gold-loans", goldLoanRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
