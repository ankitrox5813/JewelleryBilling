import pool from "../config/db.js";

export const addPayment = async (req, res) => {
  const { bill_id, payment_mode, amount } = req.body;

  if (!bill_id || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid payment data" });
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // 1️⃣ Insert payment
    await conn.query(
      `INSERT INTO payments (bill_id, payment_mode, amount)
       VALUES (?, ?, ?)`,
      [bill_id, payment_mode, amount]
    );

    // 2️⃣ Get bill totals
    const [[bill]] = await conn.query(
      `SELECT grand_total, paid_amount FROM bills WHERE id = ?`,
      [bill_id]
    );

    const newPaid = Number(bill.paid_amount) + Number(amount);
    const due = Number(bill.grand_total) - newPaid;

    let status = "due";
    if (due <= 0) status = "paid";
    else if (newPaid > 0) status = "partial";

    // 3️⃣ Update bill
    await conn.query(
      `UPDATE bills
       SET paid_amount=?, due_amount=?, payment_status=?
       WHERE id=?`,
      [newPaid, Math.max(due, 0), status, bill_id]
    );

    await conn.commit();
    res.json({ message: "Payment added", status });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};
