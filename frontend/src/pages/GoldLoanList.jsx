import { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

const GoldLoanList = () => {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    api.get("/gold-loans").then((res) => setLoans(res.data));
  }, []);

  return (
    <div>
      <h2>Gold Loans</h2>

      <table border="1" cellPadding="5" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Principal</th>
            <th>Balance</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {loans.map((l) => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.customer_name}</td>
              <td>₹{l.principal_amount.toFixed(2)}</td>
              <td>₹{l.balance_amount.toFixed(2)}</td>
              <td>{l.status.toUpperCase()}</td>
              <td>
                <Link to={`/gold-loans/${l.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GoldLoanList;
