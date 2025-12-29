import pool from "../config/db.js";
import { generateInvoicePDF } from "../utils/invoicePdf.js";
import { generateInvoiceNo } from "../utils/invoiceNo.js";

import { v4 as uuid } from "uuid";

// export const createBill = async (req, res) => {
//   const {
//     customer_id,
//     items,
//     payment_mode,
//     created_by
//   } = req.body;

//   let subtotal = 0;
//   const invoice_no = "INV-" + uuid().slice(0, 8);

//   const conn = await pool.getConnection();
//   await conn.beginTransaction();

//   try {
//     const [billResult] = await conn.query(
//       `INSERT INTO bills
//        (invoice_no, customer_id, bill_date, subtotal, sgst, cgst, grand_total, payment_mode, created_by)
//        VALUES (?, ?, NOW(), 0, 0, 0, 0, ?, ?)`,
//       [invoice_no, customer_id, payment_mode, created_by]
//     );

//     const billId = billResult.insertId;

//     for (const item of items) {
//       const metal_amount = (item.weight_grams / 10) * item.rate_per_10g;

//       const making_amount =
//         item.making_charge_type === "percent"
//           ? metal_amount * (item.making_charge_value / 100)
//           : item.making_charge_value;

//       const total_amount = metal_amount + making_amount;
//       subtotal += total_amount;

//       await conn.query(
//         `INSERT INTO bill_items
//          (bill_id, item_name, metal, purity, weight_grams, rate_per_10g,
//           making_charge_type, making_charge_value,
//           metal_amount, making_amount, total_amount)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           billId,
//           item.item_name,
//           item.metal,
//           item.purity,
//           item.weight_grams,
//           item.rate_per_10g,
//           item.making_charge_type,
//           item.making_charge_value,
//           metal_amount,
//           making_amount,
//           total_amount
//         ]
//       );
//     }

//     const sgst = subtotal * 0.015;
//     const cgst = subtotal * 0.015;
//     const grand_total = subtotal + sgst + cgst;

//     await conn.query(
//       `UPDATE bills
//        SET subtotal=?, sgst=?, cgst=?, grand_total=?
//        WHERE id=?`,
//       [subtotal, sgst, cgst, grand_total, billId]
//     );

//     await conn.commit();
//     res.json({ invoice_no, bill_id: billId });

//   } catch (err) {
//     await conn.rollback();
//     res.status(500).json(err);
//   } finally {
//     conn.release();
//   }
// };

export const createBill = async (req, res) => {
  const {
    customer_id,
    items,
    payment_mode,
    advance_amount = 0,
    created_by,
  } = req.body;

  let subtotal = 0;
  const invoice_no = generateInvoiceNo();

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // 1️⃣ Insert bill (initial)
    const [billResult] = await conn.query(
      `INSERT INTO bills
       (invoice_no, customer_id, bill_date, subtotal, sgst, cgst, grand_total,
        paid_amount, due_amount, payment_status, payment_mode, created_by)
       VALUES (?, ?, NOW(), 0, 0, 0, 0, 0, 0, 'due', ?, ?)`,
      [invoice_no, customer_id, payment_mode, created_by]
    );

    const billId = billResult.insertId;

    // Insert items
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

    //  GST
    const sgst = subtotal * 0.015;
    const cgst = subtotal * 0.015;
    const grand_total = subtotal + sgst + cgst;

    //  Payment logic
    const paid_amount = Number(advance_amount || 0);
    const due_amount = grand_total - paid_amount;

    let payment_status = "due";
    if (paid_amount >= grand_total) payment_status = "paid";
    else if (paid_amount > 0) payment_status = "partial";

    //  Update bill totals
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

    //  Insert advance payment (if any)
    if (paid_amount > 0) {
      await conn.query(
        `INSERT INTO payments (bill_id, payment_mode, amount)
         VALUES (?, ?, ?)`,
        [billId, payment_mode, paid_amount]
      );
    }

    await conn.commit();

    res.json({
      bill_id: billId,
      invoice_no,
      payment_status,
      paid_amount,
      due_amount,
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};


export const getBill = async (req, res) => {
  const billId = req.params.id;

  // const [[bill]] = await pool.query(
  //   "SELECT * FROM bills WHERE id = ?",
  //   [billId]
  // );

  const [[bill]] = await pool.query(
  `SELECT b.*, c.name AS customer_name
   FROM bills b
   JOIN customers c ON b.customer_id = c.id
   WHERE b.id = ?`,
  [billId]
);


  const [items] = await pool.query(
    "SELECT * FROM bill_items WHERE bill_id = ?",
    [billId]
  );

  if (!bill) {
    return res.status(404).json({ message: "Bill not found" });
  }

  res.json({ bill, items });
};

export const getBillPDF = async (req, res) => {
  const billId = req.params.id;

  const [[bill]] = await pool.query(
    "SELECT * FROM bills WHERE id = ?",
    [billId]
  );

  const [items] = await pool.query(
    "SELECT * FROM bill_items WHERE bill_id = ?",
    [billId]
  );

  if (!bill) return res.status(404).send("Bill not found");

  generateInvoicePDF(bill, items, res);
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
      c.name
    FROM bills b
    JOIN customers c ON b.customer_id = c.id
    ORDER BY b.id DESC
    LIMIT 50
  `);

  res.json(rows);
};



