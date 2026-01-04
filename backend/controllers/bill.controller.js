import pool from "../config/db.js";
import { generateInvoicePDF } from "../utils/invoicePdf.js";
import { generateInvoiceNo } from "../utils/invoiceNo.js";

import { v4 as uuid } from "uuid";



export const createBill = async (req, res) => {
  const {
    customer_id,
    items,
    payment_mode,
    advance_amount = 0,
    created_by,
    is_gst = true,
  } = req.body;

  let subtotal = 0;
  const invoice_no = generateInvoiceNo();

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    /* ============================
       1️⃣ INSERT BILL (INITIAL)
    ============================ */
    const [billResult] = await conn.query(
      `INSERT INTO bills
       (invoice_no, customer_id, bill_date, is_gst,
        subtotal, sgst, cgst, grand_total,
        paid_amount, due_amount, payment_status,
        payment_mode, created_by)
       VALUES (?, ?, NOW(), ?, 0, 0, 0, 0, 0, 0, 'due', ?, ?)`,
      [
        invoice_no,
        customer_id,
        is_gst ? 1 : 0,
        payment_mode,
        created_by,
      ]
    );

    const billId = billResult.insertId;

    /* ============================
       2️⃣ INSERT BILL ITEMS
    ============================ */
    for (const item of items) {
      const metal_amount =
        (Number(item.weight_grams) / 10) * Number(item.rate_per_10g);

      const making_amount =
        item.making_charge_type === "percent"
          ? (metal_amount * Number(item.making_charge_value)) / 100
          : Number(item.making_charge_value);

      const total_amount = metal_amount + making_amount;
      subtotal += total_amount;

      await conn.query(
        `INSERT INTO bill_items
         (bill_id, item_name, metal, purity, weight_grams, rate_per_10g,
          making_charge_type, making_charge_value,
          metal_amount, making_amount, total_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          billId,
          item.item_name,
          item.metal,
          item.purity,
          item.weight_grams,
          item.rate_per_10g,
          item.making_charge_type,
          item.making_charge_value,
          metal_amount,
          making_amount,
          total_amount,
        ]
      );
    }

    subtotal = Number(subtotal.toFixed(2));

    /* ============================
       3️⃣ GST / NON-GST LOGIC
    ============================ */
    let sgst = 0;
    let cgst = 0;

    if (is_gst) {
      sgst = subtotal * 0.015;
      cgst = subtotal * 0.015;
    }

    sgst = Number(sgst.toFixed(2));
    cgst = Number(cgst.toFixed(2));

    const grand_total = Number(
      (subtotal + sgst + cgst).toFixed(2)
    );

    /* ============================
       4️⃣ ADVANCE VALIDATION
    ============================ */
    const paid_amount = Number(advance_amount || 0);

    if (paid_amount < 0) {
      throw new Error("Advance amount cannot be negative");
    }

    if (paid_amount > grand_total) {
      throw new Error("Advance amount cannot exceed bill total");
    }

    const due_amount = Math.max(
      Number((grand_total - paid_amount).toFixed(2)),
      0
    );

    let payment_status = "due";
    if (paid_amount >= grand_total) payment_status = "paid";
    else if (paid_amount > 0) payment_status = "partial";

    /* ============================
       5️⃣ UPDATE BILL TOTALS
    ============================ */
    await conn.query(
      `UPDATE bills
       SET subtotal=?, sgst=?, cgst=?, grand_total=?,
           paid_amount=?, due_amount=?, payment_status=?
       WHERE id=?`,
      [
        subtotal,
        sgst,
        cgst,
        grand_total,
        paid_amount,
        due_amount,
        payment_status,
        billId,
      ]
    );

    /* ============================
       6️⃣ INSERT ADVANCE PAYMENT
    ============================ */
    if (paid_amount > 0) {
      await conn.query(
        `INSERT INTO payments (bill_id, payment_mode, amount)
         VALUES (?, ?, ?)`,
        [billId, payment_mode, paid_amount]
      );
    }

    await conn.commit();

    /* ============================
       7️⃣ RESPONSE
    ============================ */
    res.json({
      bill_id: billId,
      invoice_no,
      subtotal,
      sgst,
      cgst,
      grand_total,
      paid_amount,
      due_amount,
      payment_status,
      is_gst,
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// export const getBill = async (req, res) => {
//   const billId = req.params.id;


//   const [[bill]] = await pool.query(
//   `SELECT b.*, c.name AS customer_name, c.phone AS phone
//    FROM bills b
//    JOIN customers c ON b.customer_id = c.id
//    WHERE b.id = ?`,
//   [billId]
// );


//   const [items] = await pool.query(
//     "SELECT * FROM bill_items WHERE bill_id = ?",
//     [billId]
//   );

//   if (!bill) {
//     return res.status(404).json({ message: "Bill not found" });
//   }

//   res.json({ bill, items });
// };

export const getBill = async (req, res) => {
  const billId = req.params.id;

  const [[bill]] = await pool.query(
    `
    SELECT 
      b.*,
      c.name AS customer_name,
      c.phone AS customer_phone
    FROM bills b
    JOIN customers c ON b.customer_id = c.id
    WHERE b.id = ?
    `,
    [billId]
  );

  if (!bill) {
    return res.status(404).json({ message: "Bill not found" });
  }

  const [items] = await pool.query(
    "SELECT * FROM bill_items WHERE bill_id = ?",
    [billId]
  );

  const [payments] = await pool.query(
    `
    SELECT payment_mode, amount, payment_date
    FROM payments
    WHERE bill_id = ?
    ORDER BY payment_date ASC
    `,
    [billId]
  );

  res.json({ bill, items, payments });
};


export const getBillPDF = async (req, res) => {
  const billId = req.params.id;

  const [[bill]] = await pool.query(
    `
    SELECT 
      b.*,
      c.name AS customer_name,
      c.phone AS customer_phone
    FROM bills b
    JOIN customers c ON b.customer_id = c.id
    WHERE b.id = ?
    `,
    [billId]
  );

  if (!bill) return res.status(404).send("Bill not found");

  const [items] = await pool.query(
    "SELECT * FROM bill_items WHERE bill_id = ?",
    [billId]
  );

  const [payments] = await pool.query(
    `
    SELECT payment_mode, amount, payment_date
    FROM payments
    WHERE bill_id = ?
    ORDER BY payment_date ASC
    `,
    [billId]
  );

  generateInvoicePDF(bill, items, payments, res);
};


export const listBills = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      b.id,
      b.invoice_no,
      b.bill_date,
      b.grand_total,
      b.paid_amount,
      b.due_amount,
      b.payment_status,
      b.customer_id,
      c.name
    FROM bills b
    JOIN customers c ON b.customer_id = c.id
    ORDER BY b.id DESC
    LIMIT 50
  `);

  res.json(rows);
};

export const updateBill = async (req, res) => {
  const billId = req.params.id;
  const { items, is_gst } = req.body;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // 🔒 Do not allow edit if payments already exist
    const [[bill]] = await conn.query(
      "SELECT paid_amount FROM bills WHERE id = ?",
      [billId]
    );

    if (!bill) throw new Error("Bill not found");

    if (bill.paid_amount > 0) {
      throw new Error("Bill cannot be edited after payment");
    }

    // 🧹 Delete old items
    await conn.query("DELETE FROM bill_items WHERE bill_id = ?", [billId]);

    let subtotal = 0;

    // ➕ Insert updated items
    for (const item of items) {
      const metal_amount = (item.weight_grams / 10) * item.rate_per_10g;

      const making_amount =
        item.making_charge_type === "percent"
          ? (metal_amount * item.making_charge_value) / 100
          : Number(item.making_charge_value);

      const total_amount = metal_amount + making_amount;
      subtotal += total_amount;

      await conn.query(
        `INSERT INTO bill_items
         (bill_id, item_name, metal, purity, weight_grams, rate_per_10g,
          making_charge_type, making_charge_value,
          metal_amount, making_amount, total_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          billId,
          item.item_name,
          item.metal,
          item.purity,
          item.weight_grams,
          item.rate_per_10g,
          item.making_charge_type,
          item.making_charge_value,
          metal_amount,
          making_amount,
          total_amount,
        ]
      );
    }

    // 🧾 GST calculation
    let sgst = 0;
    let cgst = 0;

    if (is_gst) {
      sgst = subtotal * 0.015;
      cgst = subtotal * 0.015;
    }

    const grand_total = subtotal + sgst + cgst;

    // 💰 Recalculate due & status
    const paid_amount = Number(bill.paid_amount || 0);
    const due_amount = grand_total - paid_amount;

    let payment_status = "due";
    if (due_amount <= 0) payment_status = "paid";
    else if (paid_amount > 0) payment_status = "partial";

    // 🔄 Update bill
    await conn.query(
      `UPDATE bills
       SET subtotal=?, sgst=?, cgst=?, grand_total=?,
           due_amount=?, payment_status=?, is_gst=?
       WHERE id=?`,
      [
        subtotal,
        sgst,
        cgst,
        grand_total,
        due_amount,
        payment_status,
        is_gst ? 1 : 0,
        billId,
      ]
    );

    await conn.commit();
    res.json({ message: "Bill updated successfully" });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};


export const searchBills = async (req, res) => {
  const {
    invoice_no,
    customer_name,
    phone,
    from_date,
    to_date,
  } = req.query;

  let sql = `
    SELECT b.id, b.invoice_no, b.bill_date, b.grand_total,
           b.payment_status, c.name, c.phone
    FROM bills b
    JOIN customers c ON b.customer_id = c.id
    WHERE 1=1
  `;

  const params = [];

  if (invoice_no) {
    sql += " AND b.invoice_no LIKE ?";
    params.push(`%${invoice_no}%`);
  }

  if (customer_name) {
    sql += " AND c.name LIKE ?";
    params.push(`%${customer_name}%`);
  }

  if (phone) {
    sql += " AND c.phone LIKE ?";
    params.push(`%${phone}%`);
  }

  if (from_date) {
    sql += " AND DATE(b.bill_date) >= ?";
    params.push(from_date);
  }

  if (to_date) {
    sql += " AND DATE(b.bill_date) <= ?";
    params.push(to_date);
  }

  sql += " ORDER BY b.bill_date DESC LIMIT 100";

  const [rows] = await pool.query(sql, params);
  res.json(rows);
};

