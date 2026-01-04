import pool from "../config/db.js";

export const createCustomer = async (req, res) => {
  const { name, phone, address } = req.body;

  const [result] = await pool.query(
    "INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)",
    [name, phone, address]
  );

  res.json({ customer_id: result.insertId });
};

export const searchCustomer = async (req, res) => {
  const { phone } = req.query;

  const [rows] = await pool.query(
    "SELECT * FROM customers WHERE phone = ?",
    [phone]
  );

  res.json(rows);
};

export const customerSummary = async (req, res) => {
  const customerId = req.params.id;

  const [[summary]] = await pool.query(
    `
    SELECT
      COUNT(*) AS total_bills,
      COALESCE(SUM(grand_total), 0) AS total_amount,
      COALESCE(SUM(paid_amount), 0) AS total_paid,
      COALESCE(SUM(due_amount), 0) AS total_due
    FROM bills
    WHERE customer_id = ?
    `,
    [customerId]
  );

  const [dueBills] = await pool.query(
    `
    SELECT id, invoice_no, bill_date, due_amount
    FROM bills
    WHERE customer_id = ?
      AND due_amount > 0
    ORDER BY bill_date DESC
    `,
    [customerId]
  );

  res.json({ summary, dueBills });
};

export const listCustomers = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      c.id,
      c.name,
      c.phone,
      COUNT(DISTINCT b.id) AS total_bills,
      COALESCE(SUM(b.due_amount), 0) AS total_due
    FROM customers c
    LEFT JOIN bills b ON b.customer_id = c.id
    GROUP BY c.id
    ORDER BY c.name
  `);

  res.json(rows);
};

export const getCustomerProfile = async (req, res) => {
  const customerId = req.params.id;

  const [[customer]] = await pool.query(
    "SELECT * FROM customers WHERE id = ?",
    [customerId]
  );

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const [bills] = await pool.query(
    `
    SELECT id, invoice_no, bill_date, grand_total, paid_amount, due_amount, payment_status
    FROM bills
    WHERE customer_id = ?
    ORDER BY bill_date DESC
    `,
    [customerId]
  );

  res.json({ customer, bills });
};
