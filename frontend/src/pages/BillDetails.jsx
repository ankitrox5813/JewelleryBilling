import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";

const BillDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadBill();
  }, []);

  const loadBill = async () => {
    const res = await api.get(`/bills/${id}`);
    setBill(res.data.bill);
    setItems(res.data.items);
    setPayments(res.data.payments);
  };

  if (!bill) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/bills">← Back to Bills</Link>

      <h2>Invoice {bill.invoice_no}</h2>
      <p>
        <b>Customer:</b> {bill.customer_name} ({bill.customer_phone})
      </p>
      <p>
        <b>Date:</b>{" "}
        {new Date(bill.bill_date).toLocaleString("en-IN")}
      </p>
      <p>
        <b>Status:</b> {bill.payment_status.toUpperCase()}
      </p>

      {/* ACTIONS */}
      <div style={{ marginBottom: 15 }}>
        <button
          onClick={() =>
            window.open(
              `http://localhost:5000/api/bills/${bill.id}/pdf`
            )
          }
        >
          🖨 Print PDF
        </button>

        {Number(bill.paid_amount) === 0 && (
          <button
            style={{ marginLeft: 10 }}
            onClick={() => navigate(`/bills/${bill.id}/edit`)}
          >
            ✏️ Edit Bill
          </button>
        )}
      </div>

      {/* ITEMS */}
      <h3>Items</h3>
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Item</th>
            <th>Metal</th>
            <th>Purity</th>
            <th>Weight</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.item_name}</td>
              <td>{i.metal}</td>
              <td>{i.purity}</td>
              <td>{i.weight_grams} g</td>
              <td>₹{Number(i.total_amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALS */}
      <h3>Summary</h3>
      <p>Subtotal: ₹{Number(bill.subtotal).toFixed(2)}</p>
      <p>SGST: ₹{Number(bill.sgst).toFixed(2)}</p>
      <p>CGST: ₹{Number(bill.cgst).toFixed(2)}</p>
      <h3>Grand Total: ₹{Number(bill.grand_total).toFixed(2)}</h3>
      <p>Paid: ₹{Number(bill.paid_amount).toFixed(2)}</p>
      <p>Due: ₹{Number(bill.due_amount).toFixed(2)}</p>

      {/* PAYMENTS */}
      {payments.length > 0 && (
        <>
          <h3>Payments</h3>
          <ul>
            {payments.map((p, i) => (
              <li key={i}>
                {new Date(p.payment_date).toLocaleString("en-IN")} —{" "}
                {p.payment_mode.toUpperCase()} — ₹
                {Number(p.amount).toFixed(2)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default BillDetails;
