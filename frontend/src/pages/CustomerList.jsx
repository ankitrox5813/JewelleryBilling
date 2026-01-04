import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get("/customers").then((res) => setCustomers(res.data));
  }, []);

  return (
    <div>
      <h2>Customers</h2>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Total Bills</th>
            <th>Total Due</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c) => (
            <tr
              key={c.id}
              style={{ cursor: "pointer" }}
              onClick={() => window.location.href = `/customers/${c.id}`}
            >
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td>{c.total_bills}</td>
              <td>₹{Number(c.total_due).toFixed(2)}</td>
            </tr>
          ))}

          {customers.length === 0 && (
            <tr>
              <td colSpan="4" align="center">
                No customers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;
