import { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

const BillList = () => {
  const [bills, setBills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");

  const loadBills = async () => {
    const res = await api.get("/bills");
    setBills(res.data);
  };

  useEffect(() => {
    loadBills();
  }, []);

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setAmount("");
    setMode("cash");
    setShowModal(true);
  };

  const savePayment = async () => {
    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    await api.post("/payments", {
      bill_id: selectedBill.id,
      payment_mode: mode,
      amount: Number(amount),
    });

    setShowModal(false);
    loadBills();
  };

  return (
    <div>
      <h2>Bill List</h2>

      <table border="1" width="100%" cellPadding="5">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {bills.map((b) => (
            <tr key={b.id}>
              {/* <td>{b.invoice_no}</td> */}
              <td>
                <Link to={`/bills/${b.id}`} style={{ fontWeight: "bold" }}>
                  {b.invoice_no}
                </Link>
              </td>

              {/* <td>{b.name}</td> */}
              <td>
                <Link to={`/customers/${b.customer_id}`}>{b.name}</Link>
              </td>
              {/* <td>₹{b.bill_date}</td> */}
              <td>
                {new Date(b.bill_date).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </td>

              <td>₹{Number(b.grand_total).toFixed(2)}</td>
              <td>₹{Number(b.paid_amount).toFixed(2)}</td>
              <td>₹{Number(b.due_amount).toFixed(2)}</td>
              <td>{b.payment_status.toUpperCase()}</td>
              {/* <td>
                <button
                  onClick={() =>
                    window.open(`http://localhost:5000/api/bills/${b.id}/pdf`)
                  }
                >
                  🖨 Print
                </button>

                {b.due_amount > 0 && (
                  <button onClick={() => openPaymentModal(b)}>
                    ➕ Add Payment
                  </button>
                )}
              </td> */}
              <td>
                <button
                  onClick={() =>
                    window.open(`http://localhost:5000/api/bills/${b.id}/pdf`)
                  }
                >
                  🖨 Print
                </button>

                {Number(b.paid_amount) === 0 && (
                  <Link to={`/bills/${b.id}/edit`} style={{ marginLeft: 8 }}>
                    ✏️ Edit
                  </Link>
                )}

                {b.due_amount > 0 && (
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => openPaymentModal(b)}
                  >
                    ➕ Add Payment
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              background: "#fff",
              width: 300,
              margin: "100px auto",
              padding: 20,
            }}
          >
            <h3>Add Payment</h3>

            <p>
              Invoice: <b>{selectedBill.invoice_no}</b>
            </p>
            <p>Due: ₹{Number(selectedBill.due_amount).toFixed(2)}</p>

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank">Bank</option>
            </select>

            <div style={{ marginTop: 10 }}>
              <button onClick={savePayment}>Save</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BillList;
