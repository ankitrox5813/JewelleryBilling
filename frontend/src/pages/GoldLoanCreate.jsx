import { useState } from "react";
import api from "../api/api";

const emptyItem = {
  metal: "gold",
  purity: "22K",
  weight_grams: "",
  description: "",
};

const GoldLoanCreate = () => {
  const [customerId, setCustomerId] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [interestType, setInterestType] = useState("monthly");
  const [duration, setDuration] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [error, setError] = useState("");

  const addItem = () => setItems([...items, { ...emptyItem }]);

  const updateItem = (i, field, value) => {
    const copy = [...items];
    copy[i][field] = value;
    setItems(copy);
  };

  const saveLoan = async () => {
    setError("");

    if (!customerId || !principal || !interestRate) {
      setError("All required fields must be filled");
      return;
    }

    try {
      await api.post("/gold-loans", {
        customer_id: customerId,
        principal_amount: Number(principal),
        interest_rate: Number(interestRate),
        interest_input_type: interestType,
        duration_months: duration || null,
        items,
      });

      alert("✅ Gold loan created");
      setCustomerId("");
      setPrincipal("");
      setInterestRate("");
      setDuration("");
      setItems([{ ...emptyItem }]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create loan");
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>Create Gold Loan</h2>

      <input
        placeholder="Customer ID"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
      />

      <input
        placeholder="Loan Amount"
        type="number"
        value={principal}
        onChange={(e) => setPrincipal(e.target.value)}
      />

      <input
        placeholder="Interest Rate"
        type="number"
        value={interestRate}
        onChange={(e) => setInterestRate(e.target.value)}
      />

      <select
        value={interestType}
        onChange={(e) => setInterestType(e.target.value)}
      >
        <option value="monthly">Monthly %</option>
        <option value="yearly">Yearly %</option>
      </select>

      <input
        placeholder="Duration (months, optional)"
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      <h3>Deposited Gold</h3>

      {items.map((item, i) => (
        <div key={i} style={{ border: "1px solid #ccc", padding: 10 }}>
          <select
            value={item.metal}
            onChange={(e) => updateItem(i, "metal", e.target.value)}
          >
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
          </select>

          <input
            placeholder="Purity"
            value={item.purity}
            onChange={(e) => updateItem(i, "purity", e.target.value)}
          />

          <input
            placeholder="Weight (g)"
            type="number"
            value={item.weight_grams}
            onChange={(e) =>
              updateItem(i, "weight_grams", e.target.value)
            }
          />

          <input
            placeholder="Description"
            value={item.description}
            onChange={(e) =>
              updateItem(i, "description", e.target.value)
            }
          />
        </div>
      ))}

      <button onClick={addItem}>➕ Add Gold Item</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={saveLoan}>💾 Save Loan</button>
    </div>
  );
};

export default GoldLoanCreate;
