import { useState } from "react";
import api from "../api/api";

const DailyReport = () => {
  const [date, setDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    if (!date) return alert("Select a date");
    setLoading(true);
    try {
      const res = await api.get(`/reports/daily?date=${date}`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* HEADER */}
      <h2 className="text-2xl font-semibold mb-4">📊 Daily Sales Report</h2>

      {/* DATE PICKER */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3 items-center mb-6">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <button
          onClick={loadReport}
          disabled={loading}
          className="px-4 py-2 rounded bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-60"
        >
          {loading ? "Loading..." : "View Report"}
        </button>
      </div>

      {/* DATA */}
      {data && (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              label="Total Bills"
              value={data.sales.total_bills}
            />
            <SummaryCard
              label="Total Sales"
              value={`₹${Number(data.sales.total_sales).toFixed(2)}`}
            />
            <SummaryCard
              label="Collected"
              value={`₹${Number(data.sales.total_collected).toFixed(2)}`}
              accent="green"
            />
            <SummaryCard
              label="Due"
              value={`₹${Number(data.sales.total_due).toFixed(2)}`}
              accent="red"
            />
          </div>

          {/* COLLECTIONS */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-3">
              💰 Collections Breakdown
            </h3>

            {data.payments.length === 0 ? (
              <p className="text-gray-500">No collections for this date</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-amber-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Payment Mode</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => (
                    <tr key={p.payment_mode} className="border-t">
                      <td className="px-4 py-2 capitalize">
                        {p.payment_mode}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">
                        ₹{Number(p.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ===== SUMMARY CARD ===== */
const SummaryCard = ({ label, value, accent = "amber" }) => {
  const colors = {
    amber: "bg-amber-50 text-amber-800",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className={`rounded-xl p-4 shadow ${colors[accent]}`}>
      <p className="text-sm">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

export default DailyReport;
