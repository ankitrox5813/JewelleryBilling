import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const statusStyles = {
  due: "bg-red-100 text-red-700",
  partial: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-700",
};

const BillSearch = () => {
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);

  const navigate = useNavigate();

  /* =========================
     AUTO SEARCH (DEBOUNCED)
  ========================= */
  useEffect(() => {
    const timeout = setTimeout(() => {
      const cleaned = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, v]) => v !== undefined && v !== ""
        )
      );

      const query = new URLSearchParams(cleaned).toString();

      api
        .get(`/bills/search?${query}`)
        .then((res) => setResults(res.data))
        .catch(console.error);
    }, 400); // debounce delay

    return () => clearTimeout(timeout);
  }, [filters]);

  // return (
  //   <div>
  //     <h2>Search Bills</h2>

  //     {/* ===== FILTERS ===== */}
  //     <div style={{ marginBottom: 10 }}>
  //       <input
  //         placeholder="Invoice No"
  //         onChange={(e) =>
  //           setFilters({ ...filters, invoice_no: e.target.value })
  //         }
  //       />

  //       <input
  //         placeholder="Customer Name"
  //         onChange={(e) =>
  //           setFilters({ ...filters, customer_name: e.target.value })
  //         }
  //       />

  //       <input
  //         placeholder="Phone"
  //         onChange={(e) =>
  //           setFilters({ ...filters, phone: e.target.value })
  //         }
  //       />

  //       <input
  //         type="date"
  //         onChange={(e) =>
  //           setFilters({ ...filters, from_date: e.target.value })
  //         }
  //       />

  //       <input
  //         type="date"
  //         onChange={(e) =>
  //           setFilters({ ...filters, to_date: e.target.value })
  //         }
  //       />
  //     </div>

  //     {/* ===== RESULTS ===== */}
  //     <table border="1" width="100%" cellPadding="6">
  //       <thead>
  //         <tr>
  //           <th>Invoice</th>
  //           <th>Name</th>
  //           <th>Phone</th>
  //           <th>Date</th>
  //           <th>Total</th>
  //           <th>Status</th>
  //         </tr>
  //       </thead>

  //       <tbody>
  //         {results.map((b) => (
  //           <tr
  //             key={b.id}
  //             onClick={() =>
  //               navigate(`/bills/${b.id}`)
  //             }
  //             style={{
  //               cursor: "pointer",
  //               backgroundColor:
  //                 b.payment_status === "due"
  //                   ? "#ffe6e6"
  //                   : b.payment_status === "partial"
  //                   ? "#fff7cc"
  //                   : "transparent",
  //             }}
  //           >
  //             <td>{b.invoice_no}</td>
  //             <td>{b.name}</td>
  //             <td>{b.phone}</td>
  //             <td>
  //               {new Date(b.bill_date).toLocaleString("en-IN", {
  //                 day: "2-digit",
  //                 month: "short",
  //                 year: "numeric",
  //                 hour: "2-digit",
  //                 minute: "2-digit",
  //                 hour12: true,
  //               })}
  //             </td>
  //             <td>₹{Number(b.grand_total).toFixed(2)}</td>
  //             <td>{b.payment_status.toUpperCase()}</td>
  //           </tr>
  //         ))}

  //         {results.length === 0 && (
  //           <tr>
  //             <td colSpan="6" align="center">
  //               No results found
  //             </td>
  //           </tr>
  //         )}
  //       </tbody>
  //     </table>

  //     {/* ===== LEGEND ===== */}
  //     <div style={{ marginTop: 10 }}>
  //       <span style={{ background: "#ffe6e6", padding: "4px 8px" }}>
  //         DUE
  //       </span>{" "}
  //       <span style={{ background: "#fff7cc", padding: "4px 8px" }}>
  //         PARTIAL
  //       </span>{" "}
  //       <span style={{ padding: "4px 8px" }}>PAID</span>
  //     </div>
  //   </div>
  // );

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* ===== TITLE ===== */}
      <h2 className="text-2xl font-semibold mb-4">Search Bills</h2>

      {/* ===== FILTER CARD ===== */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Invoice No"
            onChange={(e) =>
              setFilters({ ...filters, invoice_no: e.target.value })
            }
          />

          <input
            className="border rounded px-3 py-2"
            placeholder="Customer Name"
            onChange={(e) =>
              setFilters({ ...filters, customer_name: e.target.value })
            }
          />

          <input
            className="border rounded px-3 py-2"
            placeholder="Phone"
            onChange={(e) =>
              setFilters({ ...filters, phone: e.target.value })
            }
          />

          <input
            type="date"
            className="border rounded px-3 py-2"
            onChange={(e) =>
              setFilters({ ...filters, from_date: e.target.value })
            }
          />

          <input
            type="date"
            className="border rounded px-3 py-2"
            onChange={(e) =>
              setFilters({ ...filters, to_date: e.target.value })
            }
          />
        </div>
      </div>

      {/* ===== RESULTS TABLE ===== */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-100 text-left">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {results.map((b) => (
              <tr
                key={b.id}
                onClick={() => navigate(`/bills/${b.id}`)}
                className="border-t hover:bg-amber-50 cursor-pointer transition"
              >
                <td className="px-4 py-3 font-medium text-blue-600">
                  {b.invoice_no}
                </td>

                <td className="px-4 py-3">{b.name}</td>

                <td className="px-4 py-3">{b.phone}</td>

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

                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      statusStyles[b.payment_status]
                    }`}
                  >
                    {b.payment_status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}

            {results.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== LEGEND ===== */}
      <div className="flex gap-3 mt-4 text-sm">
        <span className="px-2 py-1 rounded bg-red-100 text-red-700">DUE</span>
        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
          PARTIAL
        </span>
        <span className="px-2 py-1 rounded bg-green-100 text-green-700">
          PAID
        </span>
      </div>
    </div>
  );


};

export default BillSearch;
