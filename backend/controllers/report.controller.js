import pool from "../config/db.js";

export const dailyReport = async (req, res) => {
  const date = req.query.date;

  const [[sales]] = await pool.query(
    `
    SELECT
      COUNT(*) AS total_bills,
      COALESCE(SUM(grand_total), 0) AS total_sales,
      COALESCE(SUM(paid_amount), 0) AS total_collected,
      COALESCE(SUM(due_amount), 0) AS total_due
    FROM bills
    WHERE DATE(bill_date) = ?
    `,
    [date]
  );

  const [payments] = await pool.query(
    `
    SELECT payment_mode, SUM(amount) AS total
    FROM payments
    WHERE DATE(payment_date) = ?
    GROUP BY payment_mode
    `,
    [date]
  );

  res.json({ sales, payments });
};
