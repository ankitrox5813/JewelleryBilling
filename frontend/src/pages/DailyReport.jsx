import { useState } from "react";
import api from "../api/api";

const DailyReport = () => {
  const [date, setDate] = useState("");
  const [data, setData] = useState(null);

  const loadReport = async () => {
    const res = await api.get(`/reports/daily?date=${date}`);
    setData(res.data);
  };

  return (
    <div>
      <h2>Daily Sales Report</h2>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={loadReport}>View</button>

      {data && (
        <>
          <h3>Summary</h3>
          <p>Total Bills: {data.sales.total_bills}</p>
          <p>Total Sales: ₹{Number(data.sales.total_sales).toFixed(2)}</p>
          <p>Total Collected: ₹{Number(data.sales.total_collected).toFixed(2)}</p>
          <p>Total Due: ₹{Number(data.sales.total_due).toFixed(2)}</p>

          <h3>Collections</h3>
          <ul>
            {data.payments.map((p) => (
              <li key={p.payment_mode}>
                {p.payment_mode.toUpperCase()}: ₹
                {Number(p.total).toFixed(2)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default DailyReport;
