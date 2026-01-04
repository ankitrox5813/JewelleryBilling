import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

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

  return (
    <div>
      <h2>Search Bills</h2>

      {/* ===== FILTERS ===== */}
      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Invoice No"
          onChange={(e) =>
            setFilters({ ...filters, invoice_no: e.target.value })
          }
        />

        <input
          placeholder="Customer Name"
          onChange={(e) =>
            setFilters({ ...filters, customer_name: e.target.value })
          }
        />

        <input
          placeholder="Phone"
          onChange={(e) =>
            setFilters({ ...filters, phone: e.target.value })
          }
        />

        <input
          type="date"
          onChange={(e) =>
            setFilters({ ...filters, from_date: e.target.value })
          }
        />

        <input
          type="date"
          onChange={(e) =>
            setFilters({ ...filters, to_date: e.target.value })
          }
        />
      </div>

      {/* ===== RESULTS ===== */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {results.map((b) => (
            <tr
              key={b.id}
              onClick={() =>
                navigate(`/bills/${b.id}`)
              }
              style={{
                cursor: "pointer",
                backgroundColor:
                  b.payment_status === "due"
                    ? "#ffe6e6"
                    : b.payment_status === "partial"
                    ? "#fff7cc"
                    : "transparent",
              }}
            >
              <td>{b.invoice_no}</td>
              <td>{b.name}</td>
              <td>{b.phone}</td>
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
              <td>{b.payment_status.toUpperCase()}</td>
            </tr>
          ))}

          {results.length === 0 && (
            <tr>
              <td colSpan="6" align="center">
                No results found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ===== LEGEND ===== */}
      <div style={{ marginTop: 10 }}>
        <span style={{ background: "#ffe6e6", padding: "4px 8px" }}>
          DUE
        </span>{" "}
        <span style={{ background: "#fff7cc", padding: "4px 8px" }}>
          PARTIAL
        </span>{" "}
        <span style={{ padding: "4px 8px" }}>PAID</span>
      </div>
    </div>
  );
};

export default BillSearch;
