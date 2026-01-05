import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";

const StatusPill = ({ status }) => {
  const map = {
    due: "bg-red-100 text-red-700",
    partial: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        map[status] || "bg-gray-100"
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
};

const BillDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);

  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBill();
  }, []);

  const loadBill = async () => {
    const res = await api.get(`/bills/${id}`);
    setBill(res.data.bill);
    setItems(res.data.items);
    setPayments(res.data.payments || []);
  };

  const addPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (Number(amount) > Number(bill.due_amount)) {
      alert("Amount exceeds due");
      return;
    }

    try {
      setLoading(true);

      await api.post("/payments", {
        bill_id: bill.id,
        payment_mode: mode,
        amount: Number(amount),
      });

      setAmount("");
      setMode("cash");
      loadBill();
    } catch (err) {
      alert("Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  if (!bill) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* ===== BACK ===== */}
      <Link to="/bills" className="text-blue-600 text-sm hover:underline">
        ← Back to Bills
      </Link>

      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start mt-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">
            Invoice {bill.invoice_no}
          </h2>
          <p className="text-gray-600">
            {bill.customer_name} • 📞 {bill.customer_phone}
          </p>
          <p className="text-gray-500 text-sm">
            {new Date(bill.bill_date).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="text-right">
          <StatusPill status={bill.payment_status} />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() =>
                window.open(
                  `http://localhost:5000/api/bills/${bill.id}/pdf`
                )
              }
              className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600"
            >
              🖨 Print
            </button>

            {Number(bill.paid_amount) === 0 && (
              <button
                onClick={() => navigate(`/bills/${bill.id}/edit`)}
                className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-black"
              >
                ✏️ Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== ITEMS ===== */}
      <div className="bg-white rounded-xl shadow mb-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-100">
            <tr>
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3">Metal</th>
              <th className="px-4 py-3">Purity</th>
              <th className="px-4 py-3 text-right">Weight</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="px-4 py-3">{i.item_name}</td>
                <td className="px-4 py-3 text-center capitalize">
                  {i.metal}
                </td>
                <td className="px-4 py-3 text-center">{i.purity}</td>
                <td className="px-4 py-3 text-right">
                  {i.weight_grams} g
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  ₹{Number(i.total_amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== SUMMARY + PAYMENT ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SUMMARY */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold mb-4">Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{Number(bill.subtotal).toFixed(2)}</span>
            </div>

            {bill.is_gst === 1 && (
              <>
                <div className="flex justify-between">
                  <span>SGST</span>
                  <span>₹{Number(bill.sgst).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST</span>
                  <span>₹{Number(bill.cgst).toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Grand Total</span>
              <span>₹{Number(bill.grand_total).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-green-700">
              <span>Paid</span>
              <span>₹{Number(bill.paid_amount).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-red-700 font-semibold">
              <span>Due</span>
              <span>₹{Number(bill.due_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ADD PAYMENT */}
        {bill.due_amount > 0 && (
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold mb-4">Add Payment</h3>

            <div className="space-y-3">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />

              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank">Bank</option>
              </select>

              <button
                disabled={loading}
                onClick={addPayment}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "💰 Save Payment"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== PAYMENT HISTORY ===== */}
      {payments.length > 0 && (
        <div className="bg-white rounded-xl shadow p-5 mt-6">
          <h3 className="font-semibold mb-4">Payment History</h3>

          <ul className="space-y-2 text-sm">
            {payments.map((p, i) => (
              <li
                key={i}
                className="flex justify-between border-b pb-2"
              >
                <span>
                  {new Date(p.payment_date).toLocaleString("en-IN")}
                </span>
                <span className="uppercase">{p.payment_mode}</span>
                <span className="font-semibold">
                  ₹{Number(p.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BillDetails;
