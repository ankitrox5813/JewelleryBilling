import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

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
  const [isGST, setIsGST] = useState(true);

  /* =======================
     LOAD BILL (EDIT MODE)
  ======================= */
  useEffect(() => {
    if (!isEditMode) return;

    const loadBill = async () => {
      try {
        const res = await api.get(`/bills/${id}`);
        const { bill, items } = res.data;

        if (Number(bill.paid_amount) > 0) {
          alert("❌ Bill cannot be edited after payment");
          navigate("/bills");
          return;
        }

        setCustomer({
          id: bill.customer_id,
          name: bill.customer_name,
          phone: bill.customer_phone,
        });

        setItems(
          items.map((i) => ({
            item_name: i.item_name,
            metal: i.metal,
            purity: i.purity,
            weight_grams: Number(i.weight_grams),
            rate_per_10g: Number(i.rate_per_10g),
            making_charge_type: i.making_charge_type,
            making_charge_value: Number(i.making_charge_value),
            metal_amount: Number(i.metal_amount),
            making_amount: Number(i.making_amount),
            total_amount: Number(i.total_amount),
          }))
        );

        setIsGST(Boolean(bill.is_gst));
      } catch (err) {
        console.error(err);
        setError("Failed to load bill");
      }
    };

    loadBill();
  }, [id, isEditMode, navigate]);

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

  const sgst = isGST ? subtotal * 0.015 : 0;
  const cgst = isGST ? subtotal * 0.015 : 0;
  const grandTotal = subtotal + sgst + cgst;

  /* =======================
     SAVE / UPDATE BILL
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

    if (!isEditMode && takeAdvance && Number(advanceAmount) > grandTotal) {
      setError("Advance amount cannot exceed grand total");
      return;
    }

    try {
      setLoading(true);

      const customerId = customer.id
        ? customer.id
        : (
            await api.post("/customers", {
              name: customer.name,
              phone: customer.phone,
            })
          ).data.customer_id;

      if (isEditMode) {
        await api.put(`/bills/${id}`, {
          items,
          is_gst: isGST,
        });

        alert("✅ Bill updated successfully");
        navigate("/bills");
      } else {
        await api.post("/bills", {
          customer_id: customerId,
          items,
          payment_mode: "cash",
          advance_amount: takeAdvance ? Number(advanceAmount) : 0,
          is_gst: isGST,
          created_by: 1,
        });

        alert("✅ Bill saved successfully");

        setCustomer({ id: null, name: "", phone: "" });
        setItems([{ ...emptyItem }]);
        setTakeAdvance(false);
        setAdvanceAmount("");
      }
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
  <div className="max-w-6xl mx-auto px-4 pb-10">
    {/* Page Title */}
    <h1 className="text-xl font-semibold mb-6">
      {isEditMode ? "Edit Bill" : "New Bill"}
    </h1>

    {/* ===== Customer Card ===== */}
    <div className="bg-white/80 backdrop-blur rounded-xl shadow p-5 mb-6">
      <h3 className="font-medium mb-4">Customer Details</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          className="input"
          type="tel"
          maxLength="10"
          placeholder="Phone Number"
          value={customer.phone}
          disabled={isEditMode}
          onChange={(e) => {
            const phone = e.target.value;
            setCustomer({ id: null, name: "", phone });
            if (phone.length === 10) searchCustomer(phone);
          }}
        />

        <input
          className="input"
          placeholder="Customer Name"
          value={customer.name}
          onChange={(e) =>
            setCustomer((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      </div>
    </div>

    {/* ===== Items ===== */}
    <div className="bg-white/80 backdrop-blur rounded-xl shadow p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Items</h3>
        <button onClick={addItem} className="btn-secondary">
          ➕ Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-amber-100">
            <tr>
              <th className="th">Item</th>
              <th className="th">Metal</th>
              <th className="th">Purity</th>
              <th className="th">Wt (g)</th>
              <th className="th">Rate /10g</th>
              <th className="th">Making</th>
              <th className="th">Total</th>
              <th className="th"></th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-t">
                <td><input className="input-sm" value={item.item_name}
                  onChange={(e) => updateItem(i, "item_name", e.target.value)} /></td>

                <td>
                  <select className="input-sm" value={item.metal}
                    onChange={(e) => updateItem(i, "metal", e.target.value)}>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                  </select>
                </td>

                <td>
                  <select className="input-sm" value={item.purity}
                    onChange={(e) => updateItem(i, "purity", e.target.value)}>
                    <option>24K</option>
                    <option>22K</option>
                    <option>18K</option>
                    <option>Silver</option>
                  </select>
                </td>

                <td><input className="input-sm" type="number" value={item.weight_grams}
                  onChange={(e) => updateItem(i, "weight_grams", e.target.value)} /></td>

                <td><input className="input-sm" type="number" value={item.rate_per_10g}
                  onChange={(e) => updateItem(i, "rate_per_10g", e.target.value)} /></td>

                <td className="space-y-1">
                  <select className="input-sm" value={item.making_charge_type}
                    onChange={(e) => updateItem(i, "making_charge_type", e.target.value)}>
                    <option value="fixed">₹ Fixed</option>
                    <option value="percent">%</option>
                  </select>

                  <input className="input-sm" type="number"
                    value={item.making_charge_value}
                    onChange={(e) => updateItem(i, "making_charge_value", e.target.value)} />
                </td>

                <td className="font-medium">
                  ₹ {item.total_amount.toFixed(2)}
                </td>

                <td>
                  <button onClick={() => removeItem(i)} className="text-red-500">
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* ===== Payment (Create only) ===== */}
    {!isEditMode && (
      <div className="bg-white/80 backdrop-blur rounded-xl shadow p-5 mb-6">
        <h3 className="font-medium mb-3">Payment</h3>

        <label className="flex items-center gap-2 text-sm">
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
            className="input mt-3 w-40"
            type="number"
            placeholder="Advance Amount"
            value={advanceAmount}
            onChange={(e) => setAdvanceAmount(e.target.value)}
          />
        )}
      </div>
    )}

    {/* ===== Summary ===== */}
    <div className="bg-white/90 backdrop-blur rounded-xl shadow p-5">
      <h3 className="font-medium mb-3">Summary</h3>

      <label className="flex items-center gap-2 mb-3 text-sm">
        <input
          type="checkbox"
          checked={isGST}
          onChange={(e) => setIsGST(e.target.checked)}
        />
        Apply GST (3%)
      </label>

      <div className="space-y-1 text-sm">
        <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
        {isGST && (
          <>
            <p>SGST: ₹{sgst.toFixed(2)}</p>
            <p>CGST: ₹{cgst.toFixed(2)}</p>
          </>
        )}
      </div>

      <div className="text-xl font-semibold mt-4">
        Grand Total: ₹{grandTotal.toFixed(2)}
      </div>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      <button
        disabled={loading}
        onClick={saveBill}
        className="btn-primary mt-4"
      >
        {loading ? "Saving..." : isEditMode ? "✏️ Update Bill" : "💾 Save Bill"}
      </button>
    </div>
  </div>
);

  // return (
  //   <div style={{ maxWidth: 1100 }}>


  //     <h3>Customer Details</h3>

  //     <input
  //       type="tel"
  //       maxLength="10"
  //       placeholder="Phone Number"
  //       value={customer.phone}
  //       disabled={isEditMode}
  //       onChange={(e) => {
  //         const phone = e.target.value;
  //         setCustomer({ id: null, name: "", phone });
  //         if (phone.length === 10) searchCustomer(phone);
  //       }}
  //     />

  //     <input
  //       placeholder="Customer Name"
  //       value={customer.name}
  //       onChange={(e) =>
  //         setCustomer((prev) => ({ ...prev, name: e.target.value }))
  //       }
  //     />

  //     <h3>Items</h3>

  //     <table width="100%" border="1" cellPadding="5">
  //       <thead>
  //         <tr>
  //           <th>Item</th>
  //           <th>Metal</th>
  //           <th>Purity</th>
  //           <th>Wt (g)</th>
  //           <th>Rate /10g</th>
  //           <th>Making</th>
  //           <th>Total ₹</th>
  //           <th></th>
  //         </tr>
  //       </thead>

  //       <tbody>
  //         {items.map((item, i) => (
  //           <tr key={i}>
  //             <td>
  //               <input
  //                 value={item.item_name}
  //                 onChange={(e) => updateItem(i, "item_name", e.target.value)}
  //               />
  //             </td>

  //             <td>
  //               <select
  //                 value={item.metal}
  //                 onChange={(e) => updateItem(i, "metal", e.target.value)}
  //               >
  //                 <option value="gold">Gold</option>
  //                 <option value="silver">Silver</option>
  //               </select>
  //             </td>

  //             <td>
  //               <select
  //                 value={item.purity}
  //                 onChange={(e) => updateItem(i, "purity", e.target.value)}
  //               >
  //                 <option value="24K">24K</option>
  //                 <option value="22K">22K</option>
  //                 <option value="18K">18K</option>
  //                 <option value="Silver">Silver</option>
  //               </select>
  //             </td>

  //             <td>
  //               <input
  //                 type="number"
  //                 step="0.001"
  //                 value={item.weight_grams}
  //                 onChange={(e) =>
  //                   updateItem(i, "weight_grams", e.target.value)
  //                 }
  //               />
  //             </td>

  //             <td>
  //               <input
  //                 type="number"
  //                 value={item.rate_per_10g}
  //                 onChange={(e) =>
  //                   updateItem(i, "rate_per_10g", e.target.value)
  //                 }
  //               />
  //             </td>

  //             <td>
  //               <select
  //                 value={item.making_charge_type}
  //                 onChange={(e) =>
  //                   updateItem(i, "making_charge_type", e.target.value)
  //                 }
  //               >
  //                 <option value="fixed">₹ Fixed</option>
  //                 <option value="percent">% Percent</option>
  //               </select>

  //               <input
  //                 type="number"
  //                 value={item.making_charge_value}
  //                 onChange={(e) =>
  //                   updateItem(i, "making_charge_value", e.target.value)
  //                 }
  //               />
  //             </td>

  //             <td>₹ {item.total_amount.toFixed(2)}</td>

  //             <td>
  //               <button onClick={() => removeItem(i)}>❌</button>
  //             </td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>

  //     <button onClick={addItem}>➕ Add Item</button>

  //     {!isEditMode && (
  //       <>
  //         <h3>Payment</h3>

  //         <label>
  //           <input
  //             type="checkbox"
  //             checked={takeAdvance}
  //             onChange={(e) => {
  //               setTakeAdvance(e.target.checked);
  //               if (!e.target.checked) setAdvanceAmount("");
  //             }}
  //           />
  //           Take advance payment
  //         </label>

  //         {takeAdvance && (
  //           <input
  //             type="number"
  //             placeholder="Advance Amount"
  //             value={advanceAmount}
  //             onChange={(e) => setAdvanceAmount(e.target.value)}
  //           />
  //         )}
  //       </>
  //     )}

  //     <h3>Summary</h3>

  //     <label>
  //       <input
  //         type="checkbox"
  //         checked={isGST}
  //         onChange={(e) => setIsGST(e.target.checked)}
  //       />
  //       Apply GST (3%)
  //     </label>

  //     <p>Subtotal: ₹{subtotal.toFixed(2)}</p>

  //     {isGST && (
  //       <>
  //         <p>SGST (1.5%): ₹{sgst.toFixed(2)}</p>
  //         <p>CGST (1.5%): ₹{cgst.toFixed(2)}</p>
  //       </>
  //     )}

  //     <h2>Grand Total: ₹{grandTotal.toFixed(2)}</h2>

  //     {error && <p style={{ color: "red" }}>{error}</p>}

  //     <button disabled={loading} onClick={saveBill}>
  //       {loading ? "Saving..." : isEditMode ? "✏️ Update Bill" : "💾 Save Bill"}
  //     </button>
  //   </div>
  // );
};

export default BillingForm;
