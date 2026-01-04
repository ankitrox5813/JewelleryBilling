import PDFDocument from "pdfkit";

export const generateInvoicePDF = (bill, items, payments, res) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=${bill.invoice_no}.pdf`
  );

  doc.pipe(res);

  /* ===== HEADER ===== */
  doc.fontSize(18).text("JEWELLERY SHOP", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Invoice No: ${bill.invoice_no}`);
  doc.text(
    `Date: ${new Date(bill.bill_date).toLocaleString("en-IN")}`
  );
  doc.moveDown();

  /* ===== CUSTOMER ===== */
  doc.fontSize(12).text("Customer Details");
doc.text(`Name: ${bill.customer_name || ""}`);
doc.text(`Phone: ${bill.customer_phone || ""}`);
  doc.moveDown();

  /* ===== ITEMS ===== */
  doc.fontSize(12).text("Items");
  doc.moveDown(0.5);

  items.forEach((i, index) => {
    const total = Number(i.total_amount || 0);

    doc.text(
      `${index + 1}. ${i.item_name} | ${i.metal.toUpperCase()} | ${
        i.purity
      } | ${i.weight_grams}g | Rs. ${total.toFixed(2)}`
    );
  });

  doc.moveDown();

  /* ===== TOTALS ===== */
  const subtotal = Number(bill.subtotal || 0);
  const sgst = Number(bill.sgst || 0);
  const cgst = Number(bill.cgst || 0);
  const grandTotal = Number(bill.grand_total || 0);
  const paid = Number(bill.paid_amount || 0);
  const due = Number(bill.due_amount || 0);

  doc.fontSize(12);
  doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`);
  doc.text(`SGST (1.5%): Rs. ${sgst.toFixed(2)}`);
  doc.text(`CGST (1.5%): Rs. ${cgst.toFixed(2)}`);
  doc.moveDown(0.5);

  doc.fontSize(13).text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`);
  doc.moveDown(0.5);

  /* ===== PAYMENT SUMMARY ===== */
  doc.fontSize(12);
  doc.text(`Advance Paid: Rs. ${paid.toFixed(2)}`);
  doc.text(`Balance Due: Rs. ${due.toFixed(2)}`);
  doc.moveDown(0.5);

  doc.fontSize(13).text(
    `Payment Status: ${bill.payment_status.toUpperCase()}`
  );

  doc.moveDown();

  /* ===== PAYMENT HISTORY ===== */
  if (payments && payments.length > 0) {
    doc.fontSize(12).text("Payment History");
    doc.moveDown(0.5);

    payments.forEach((p, index) => {
      doc.text(
        `${index + 1}. ${new Date(p.payment_date).toLocaleString(
          "en-IN"
        )} | ${p.payment_mode.toUpperCase()} | Rs. ${Number(
          p.amount
        ).toFixed(2)}`
      );
    });

    doc.moveDown();
  }

  /* ===== FOOTER ===== */
  doc.fontSize(10).text("Thank you for your business!", {
    align: "center",
  });

  doc.end();
};

