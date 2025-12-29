import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

const CustomerProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/customers/${id}/summary`).then((res) => {
      setData(res.data);
    });
  }, [id]);

  if (!data) return <p>Loading...</p>;

  const { summary, dueBills } = data;

  return (
    <div>
      <h2>Customer Profile</h2>

      <p>Total Bills: {summary.total_bills}</p>
      <p>Total Amount: ₹{Number(summary.total_amount).toFixed(2)}</p>
      <p>Total Paid: ₹{Number(summary.total_paid).toFixed(2)}</p>
      <h3>Total Due: ₹{Number(summary.total_due).toFixed(2)}</h3>

      {dueBills.length > 0 && (
        <>
          <h3>Pending Bills</h3>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {dueBills.map((b) => (
                <tr key={b.id}>
                  <td>{b.invoice_no}</td>
                  <td>{new Date(b.bill_date).toLocaleDateString()}</td>
                  <td>₹{Number(b.due_amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default CustomerProfile;
