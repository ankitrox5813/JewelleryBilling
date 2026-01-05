import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

const statusStyles = {
  due: "bg-red-100 text-red-700",
  partial: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-700",
};

const BillList = () => {
  const [bills, setBills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");

  const navigate = useNavigate();

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
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (Number(amount) > Number(selectedBill.due_amount)) {
      alert("Amount exceeds due");
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
    <div className="max-w-7xl mx-auto px-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Bills</h2>

        <Link
          to="/"
          className="px-4 py-2 rounded bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          ➕ New Bill
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-100">
            <tr>
              <th className="px-4 py-3 text-left">Invoice</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3 text-right">Due</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bills.map((b) => (
              <tr key={b.id} className="border-t hover:bg-amber-50">
                <td
                  className="px-4 py-3 font-medium text-blue-600 cursor-pointer"
                  onClick={() => navigate(`/bills/${b.id}`)}
                >
                  {b.invoice_no}
                </td>

                <td className="px-4 py-3">
                  <Link
                    to={`/customers/${b.customer_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {b.name}
                  </Link>
                </td>

                <td className="px-4 py-3">
                  {new Date(b.bill_date).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>

                <td className="px-4 py-3 text-right font-semibold">
                  ₹{Number(b.grand_total).toFixed(2)}
                </td>

                <td className="px-4 py-3 text-right">
                  ₹{Number(b.paid_amount).toFixed(2)}
                </td>

                <td className="px-4 py-3 text-right">
                  ₹{Number(b.due_amount).toFixed(2)}
                </td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      statusStyles[b.payment_status]
                    }`}
                  >
                    {b.payment_status.toUpperCase()}
                  </span>
                </td>

                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() =>
                      window.open(
                        `http://localhost:5000/api/bills/${b.id}/pdf`
                      )
                    }
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                  >
                    🖨
                  </button>

                  {Number(b.paid_amount) === 0 && (
                    <Link
                      to={`/bills/${b.id}/edit`}
                      className="px-2 py-1 border rounded hover:bg-gray-100"
                    >
                      ✏️
                    </Link>
                  )}

                  {b.due_amount > 0 && (
                    <button
                      onClick={() => openPaymentModal(b)}
                      className="px-2 py-1 border rounded hover:bg-gray-100"
                    >
                      ➕
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {bills.length === 0 && (
              <tr>
                <td colSpan="8" className="py-6 text-center text-gray-500">
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAYMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow">
            <h3 className="text-lg font-semibold mb-3">Add Payment</h3>

            <p className="text-sm mb-1">
              Invoice: <b>{selectedBill.invoice_no}</b>
            </p>
            <p className="text-sm mb-3">
              Due: ₹{Number(selectedBill.due_amount).toFixed(2)}
            </p>

            <input
              type="number"
              placeholder="Amount"
              className="w-full border rounded px-3 py-2 mb-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <select
              className="w-full border rounded px-3 py-2 mb-4"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank">Bank</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={savePayment}
                className="px-3 py-1 bg-amber-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillList;
