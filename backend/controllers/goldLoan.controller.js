import pool from "../config/db.js";

/* ============================
   CREATE GOLD LOAN
============================ */
export const createGoldLoan = async (req, res) => {
  const {
    customer_id,
    principal_amount,
    interest_rate,
    interest_input_type, // monthly / yearly
    duration_months = null,
    items,
    remarks,
  } = req.body;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    if (!customer_id || !principal_amount || !interest_rate || !items?.length) {
      throw new Error("Missing required fields");
    }

    // Convert yearly → monthly if needed
    const monthlyInterest =
      interest_input_type === "yearly"
        ? Number(interest_rate) / 12
        : Number(interest_rate);

    const [loanResult] = await conn.query(
      `INSERT INTO gold_loans
       (customer_id, principal_amount, interest_rate,
        interest_input_type, duration_months,
        start_date, balance_amount, remarks)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
      [
        customer_id,
        principal_amount,
        monthlyInterest,
        interest_input_type,
        duration_months,
        principal_amount,
        remarks,
      ]
    );

    const loanId = loanResult.insertId;

    // Insert gold items
    for (const item of items) {
      await conn.query(
        `INSERT INTO gold_loan_items
         (loan_id, metal, purity, weight_grams, description)
         VALUES (?, ?, ?, ?, ?)`,
        [
          loanId,
          item.metal,
          item.purity,
          item.weight_grams,
          item.description,
        ]
      );
    }

    await conn.commit();

    res.json({
      loan_id: loanId,
      status: "active",
    });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};


/* ============================
   ADD EMI PAYMENT
============================ */
export const addGoldLoanPayment = async (req, res) => {
  const loanId = req.params.id;
  const { amount, payment_mode, remarks } = req.body;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const [[loan]] = await conn.query(
      "SELECT * FROM gold_loans WHERE id = ? AND status = 'active'",
      [loanId]
    );

    if (!loan) throw new Error("Active loan not found");

    if (amount <= 0) throw new Error("Invalid payment amount");

    const monthlyInterest =
      (loan.principal_amount * loan.interest_rate) / 100;

    let interest_component = monthlyInterest;
    let principal_component = amount - interest_component;

    if (principal_component < 0) {
      interest_component = amount;
      principal_component = 0;
    }

    const newBalance = Math.max(
      loan.balance_amount - principal_component,
      0
    );

    await conn.query(
      `INSERT INTO gold_loan_payments
       (loan_id, amount, interest_component,
        principal_component, balance_after, payment_mode, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        loanId,
        amount,
        interest_component,
        principal_component,
        newBalance,
        payment_mode,
        remarks,
      ]
    );

    await conn.query(
      `UPDATE gold_loans
       SET total_paid = total_paid + ?,
           total_interest_paid = total_interest_paid + ?,
           balance_amount = ?
       WHERE id = ?`,
      [amount, interest_component, newBalance, loanId]
    );

    await conn.commit();

    res.json({
      loan_id: loanId,
      interest_component,
      principal_component,
      balance_amount: newBalance,
    });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};


/* ============================
   GET LOAN DETAILS
============================ */
export const getGoldLoanDetails = async (req, res) => {
  const loanId = req.params.id;

  const [[loan]] = await pool.query(
    "SELECT * FROM gold_loans WHERE id = ?",
    [loanId]
  );

  if (!loan) return res.status(404).json({ error: "Loan not found" });

  const [items] = await pool.query(
    "SELECT * FROM gold_loan_items WHERE loan_id = ?",
    [loanId]
  );

  const [payments] = await pool.query(
    "SELECT * FROM gold_loan_payments WHERE loan_id = ? ORDER BY payment_date",
    [loanId]
  );

  res.json({ loan, items, payments });
};


/* ============================
   CLOSE LOAN
============================ */
export const closeGoldLoan = async (req, res) => {
  const loanId = req.params.id;
  const { remarks } = req.body;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const [[loan]] = await conn.query(
      "SELECT * FROM gold_loans WHERE id = ?",
      [loanId]
    );

    if (!loan) throw new Error("Loan not found");

    if (loan.balance_amount > 0) {
      throw new Error("Loan cannot be closed. Balance pending.");
    }

    await conn.query(
      "UPDATE gold_loans SET status = 'closed' WHERE id = ?",
      [loanId]
    );

    await conn.query(
      `INSERT INTO gold_return_receipts (loan_id, remarks)
       VALUES (?, ?)`,
      [loanId, remarks]
    );

    await conn.commit();

    res.json({ status: "closed" });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};
