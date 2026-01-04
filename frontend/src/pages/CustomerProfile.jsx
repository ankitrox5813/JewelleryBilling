import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";

const CustomerProfile = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [bills, setBills] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const res = await api.get(`/customers/${id}`);
    setCustomer(res.data.customer);
    setBills(res.data.bills);
  };

  if (!customer) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/customers">← Back to Customers</Link>

      <h2>{customer.name}</h2>
      <p>📞 {customer.phone}</p>

      <h3>Bills</h3>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Date</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Status</th>
          </tr>
        </thead>

        {/* ✅ YOUR CODE GOES EXACTLY HERE */}
        <tbody>
          {bills.map((b) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerProfile;
