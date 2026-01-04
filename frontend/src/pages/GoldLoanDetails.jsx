import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

const GoldLoanDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");

  const load = async () => {
    const res = await api.get(`/gold-loans/${id}`);
    setData(res.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  const addPayment = async () => {
    await api.post(`/gold-loans/${id}/payments`, {
      amount: Number(amount),
      payment_mode: mode,
    });

    setAmount("");
    load();
  };

  if (!data) return <p>Loading...</p>;

  const { loan, items, payments } = data;

  return (
    <div>
      <h2>Gold Loan #{loan.id}</h2>

      <p>Principal: ₹{loan.principal_amount.toFixed(2)}</p>
      <p>Balance: ₹{loan.balance_amount.toFixed(2)}</p>
      <p>Status: {loan.status.toUpperCase()}</p>

      <h3>Deposited Gold</h3>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            {i.metal} | {i.purity} | {i.weight_grams}g | {i.description}
          </li>
        ))}
      </ul>

      {loan.status === "active" && (
        <>
          <h3>Add EMI Payment</h3>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="bank">Bank</option>
          </select>

          <button onClick={addPayment}>Save Payment</button>
        </>
      )}

      <h3>Payment History</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Interest</th>
            <th>Principal</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{new Date(p.payment_date).toLocaleString("en-IN")}</td>
              <td>₹{p.amount.toFixed(2)}</td>
              <td>₹{p.interest_component.toFixed(2)}</td>
              <td>₹{p.principal_component.toFixed(2)}</td>
              <td>₹{p.balance_after.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GoldLoanDetails;
