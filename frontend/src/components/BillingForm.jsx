import { useState } from "react";
import api from "../api/api";

const emptyItem = {
  item_name: "",
  metal: "gold",
  purity: "22K",
  weight_grams: "",
  rate_per_10g: "",
  making_charge_type: "fixed",
  making_charge_value: "",
  metal_amount: 0,
  making_amount: 0,
  total_amount: 0,
};

const BillingForm = () => {
  const [customer, setCustomer] = useState({
    id: null,
    name: "",
    phone: "",
  });

  const [items, setItems] = useState([{ ...emptyItem }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [takeAdvance, setTakeAdvance] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");

  /* =======================
     CUSTOMER SEARCH
  ======================= */
  const searchCustomer = async (phone) => {
    try {
      const res = await api.get(`/customers/search?phone=${phone}`);
      if (res.data.length) {
        setCustomer({
          id: res.data[0].id,
          name: res.data[0].name,
          phone: res.data[0].phone,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =======================
     ITEM CALCULATION
  ======================= */
  const calculateItem = (item) => {
    const weight = Number(item.weight_grams);
    const rate = Number(item.rate_per_10g);
    const makingVal = Number(item.making_charge_value);

    if (!weight || !rate) {
      return { ...item, metal_amount: 0, making_amount: 0, total_amount: 0 };
    }

    const metal_amount = (weight / 10) * rate;
    const making_amount =
      item.making_charge_type === "percent"
        ? (metal_amount * makingVal) / 100
        : makingVal;

    return {
      ...item,
      metal_amount,
      making_amount,
      total_amount: metal_amount + making_amount,
    };
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = calculateItem({
      ...updated[index],
      [field]: value,
    });
    setItems(updated);
  };

  const addItem = () => setItems([...items, { ...emptyItem }]);

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  /* =======================
     TOTALS
  ======================= */
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.total_amount || 0),
    0
  );

  const sgst = subtotal * 0.015;
  const cgst = subtotal * 0.015;
  const grandTotal = subtotal + sgst + cgst;

  /* =======================
     SAVE BILL
  ======================= */
  const saveBill = async () => {
    setError("");

    if (!customer.phone || customer.phone.length !== 10) {
      setError("Valid phone number is required");
      return;
    }

    if (!customer.name) {
      setError("Customer name is required");
      return;
    }

    if (items.some((i) => !i.item_name || !i.weight_grams || !i.rate_per_10g)) {
      setError("All item fields are required");
      return;
    }

    try {
      setLoading(true);

      // ✅ Use existing customer OR create new
      const customerId = customer.id
        ? customer.id
        : (
            await api.post("/customers", {
              name: customer.name,
              phone: customer.phone,
            })
          ).data.customer_id;

      //   await api.post("/bills", {
      //     customer_id: customerId,
      //     items,
      //     payment_mode: "cash",
      //     created_by: 1,
      //   });
      await api.post("/bills", {
        customer_id: customerId,
        items,
        payment_mode: "cash",
        advance_amount: takeAdvance ? Number(advanceAmount) : 0,
        created_by: 1,
      });

      alert("✅ Bill saved successfully");

      setCustomer({ id: null, name: "", phone: "" });
      setItems([{ ...emptyItem }]);
    } catch (err) {
      console.error(err);
      setError("Failed to save bill");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <div style={{ maxWidth: 1100 }}>
      <h2>Jewellery Billing</h2>

      <h3>Customer Details</h3>

      <input
        type="tel"
        maxLength="10"
        placeholder="Phone Number"
        value={customer.phone}
        onChange={(e) => {
          const phone = e.target.value;
          setCustomer({ id: null, name: "", phone });
          if (phone.length === 10) searchCustomer(phone);
        }}
      />

      <input
        placeholder="Customer Name"
        value={customer.name}
        onChange={(e) =>
          setCustomer((prev) => ({ ...prev, name: e.target.value }))
        }
      />

      <h3>Items</h3>

      <table width="100%" border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Item</th>
            <th>Metal</th>
            <th>Purity</th>
            <th>Wt (g)</th>
            <th>Rate /10g</th>
            <th>Making</th>
            <th>Total ₹</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              {/* Item name */}
              <td>
                <input
                  value={item.item_name}
                  onChange={(e) => updateItem(i, "item_name", e.target.value)}
                />
              </td>

              {/* Metal */}
              <td>
                <select
                  value={item.metal}
                  onChange={(e) => updateItem(i, "metal", e.target.value)}
                >
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                </select>
              </td>

              {/* Purity */}
              <td>
                <select
                  value={item.purity}
                  onChange={(e) => updateItem(i, "purity", e.target.value)}
                >
                  <option value="24K">24K</option>
                  <option value="22K">22K</option>
                  <option value="18K">18K</option>
                  <option value="Silver">Silver</option>
                </select>
              </td>

              {/* Weight */}
              <td>
                <input
                  type="number"
                  step="0.001"
                  value={item.weight_grams}
                  onChange={(e) =>
                    updateItem(i, "weight_grams", e.target.value)
                  }
                />
              </td>

              {/* Rate */}
              <td>
                <input
                  type="number"
                  value={item.rate_per_10g}
                  onChange={(e) =>
                    updateItem(i, "rate_per_10g", e.target.value)
                  }
                />
              </td>

              {/* Making */}
              <td>
                <select
                  value={item.making_charge_type}
                  onChange={(e) =>
                    updateItem(i, "making_charge_type", e.target.value)
                  }
                >
                  <option value="fixed">₹ Fixed</option>
                  <option value="percent">% Percent</option>
                </select>

                <input
                  type="number"
                  placeholder={
                    item.making_charge_type === "percent"
                      ? "Making %"
                      : "Making ₹"
                  }
                  value={item.making_charge_value}
                  onChange={(e) =>
                    updateItem(i, "making_charge_value", e.target.value)
                  }
                />
              </td>

              {/* Total */}
              <td>₹ {item.total_amount.toFixed(2)}</td>

              {/* Remove */}
              <td>
                <button onClick={() => removeItem(i)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addItem}>➕ Add Item</button>

      <h3>Payment</h3>

      <label>
        <input
          type="checkbox"
          checked={takeAdvance}
          onChange={(e) => {
            setTakeAdvance(e.target.checked);
            if (!e.target.checked) setAdvanceAmount("");
          }}
        />
        Take advance payment
      </label>

      {takeAdvance && (
        <input
          type="number"
          placeholder="Advance Amount"
          value={advanceAmount}
          onChange={(e) => setAdvanceAmount(e.target.value)}
        />
      )}

      <h3>Summary</h3>
      <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
      <p>SGST (1.5%): ₹{sgst.toFixed(2)}</p>
      <p>CGST (1.5%): ₹{cgst.toFixed(2)}</p>
      <h2>Grand Total: ₹{grandTotal.toFixed(2)}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button disabled={loading} onClick={saveBill}>
        {loading ? "Saving..." : "💾 Save Bill"}
      </button>
    </div>
  );
};

export default BillingForm;
