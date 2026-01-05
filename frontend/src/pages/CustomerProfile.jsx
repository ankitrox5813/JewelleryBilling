import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const res = await api.get(`/customers/${id}`);
    setCustomer(res.data.customer);
    setBills(res.data.bills);
  };

  if (!customer) return <p className="p-4">Loading...</p>;

  /* ===== SUMMARY CALCS ===== */
  const totalBills = bills.length;
  const totalAmount = bills.reduce((s, b) => s + Number(b.grand_total), 0);
  const totalPaid = bills.reduce((s, b) => s + Number(b.paid_amount), 0);
  const totalDue = bills.reduce((s, b) => s + Number(b.due_amount), 0);

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* ===== BACK ===== */}
      <Link
        to="/customers"
        className="text-blue-600 text-sm hover:underline"
      >
        ← Back to Customers
      </Link>

      {/* ===== HEADER ===== */}
      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-semibold">{customer.name}</h2>
        <p className="text-gray-600">📞 {customer.phone}</p>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Total Bills</p>
          <p className="text-xl font-bold">{totalBills}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-xl font-bold">
            ₹{totalAmount.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-xl font-bold text-green-700">
            ₹{totalPaid.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Due</p>
          <p className="text-xl font-bold text-red-700">
            ₹{totalDue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* ===== BILL LIST ===== */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-100">
            <tr>
              <th className="px-4 py-3 text-left">Invoice</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3 text-right">Due</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {bills.map((b) => (
              <tr
                key={b.id}
                onClick={() => navigate(`/bills/${b.id}`)}
                className={`border-t cursor-pointer transition
                  hover:bg-amber-50
                  ${
                    b.payment_status === "due"
                      ? "bg-red-50"
                      : b.payment_status === "partial"
                      ? "bg-yellow-50"
                      : ""
                  }
                `}
              >
                <td className="px-4 py-3 text-blue-600 font-medium">
                  {b.invoice_no}
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

                <td className="px-4 py-3 text-right">
                  ₹{Number(b.grand_total).toFixed(2)}
                </td>

                <td className="px-4 py-3 text-right">
                  ₹{Number(b.paid_amount).toFixed(2)}
                </td>

                <td className="px-4 py-3 text-right font-semibold">
                  ₹{Number(b.due_amount).toFixed(2)}
                </td>

                <td className="px-4 py-3 text-center">
                  <StatusPill status={b.payment_status} />
                </td>
              </tr>
            ))}

            {bills.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500"
                >
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerProfile;
