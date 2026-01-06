import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

export const generateInvoicePDF = async (bill, items, payments, res) => {
  let browser;

  try {
    const templatePath = path.join(process.cwd(), "templates", "invoice.html");
    let html = fs.readFileSync(templatePath, "utf8");

    // ITEMS
    const itemRows = items.map((i, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${i.item_name}</td>
        <td>${i.weight_grams} g</td>
        <td>₹${Number(i.rate_per_10g).toFixed(2)}</td>
        <td>${i.making_charge_value}${i.making_charge_type === "percent" ? "%" : ""}</td>
        <td class="right">₹${Number(i.total_amount).toFixed(2)}</td>
      </tr>
    `).join("");

    // PAYMENT HISTORY
    const paymentsSection = payments?.length
      ? `
        <div class="box">
          <b>Payment History</b>
          <table>
            <tr>
              <th>Date</th>
              <th>Mode</th>
              <th class="right">Amount</th>
            </tr>
            ${payments.map(p => `
              <tr>
                <td>${new Date(p.payment_date).toLocaleDateString("en-IN")}</td>
                <td>${p.payment_mode.toUpperCase()}</td>
                <td class="right">₹${Number(p.amount).toFixed(2)}</td>
              </tr>
            `).join("")}
          </table>
        </div>
      `
      : "";

      const gstRows = bill.is_gst
  ? `
    <tr>
      <td>SGST (1.5%)</td>
      <td class="right">₹${Number(bill.sgst).toFixed(2)}</td>
    </tr>
    <tr>
      <td>CGST (1.5%)</td>
      <td class="right">₹${Number(bill.cgst).toFixed(2)}</td>
    </tr>
  `
  : "";


    html = html
      .replace("{{invoice_no}}", bill.invoice_no)
      .replace("{{invoice_date}}", new Date(bill.bill_date).toLocaleDateString("en-IN"))
      .replace("{{customer_name}}", bill.customer_name || "")
      .replace("{{customer_phone}}", bill.customer_phone || "")
      .replace("{{items_rows}}", itemRows)
      .replace("{{subtotal}}", `₹${Number(bill.subtotal).toFixed(2)}`)
      .replace("{{gst_rows}}", gstRows)
      // .replace("{{sgst}}", `₹${Number(bill.sgst).toFixed(2)}`)
      // .replace("{{cgst}}", `₹${Number(bill.cgst).toFixed(2)}`)
      .replace("{{grand_total}}", `₹${Number(bill.grand_total).toFixed(2)}`)
      .replace("{{paid_amount}}", `₹${Number(bill.paid_amount || 0).toFixed(2)}`)
      .replace("{{due_amount}}", `₹${Number(bill.due_amount || 0).toFixed(2)}`)
      .replace("{{payments_section}}", paymentsSection);

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=${bill.invoice_no}.pdf`);
    res.end(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate invoice PDF" });
  } finally {
    if (browser) await browser.close();
  }
};
