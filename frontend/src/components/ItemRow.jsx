const ItemRow = ({ item, onChange }) => {
  const calculate = (updated) => {
    const metalAmount = (updated.weight_grams / 10) * updated.rate_per_10g;

    const makingAmount =
      updated.making_charge_type === "percent"
        ? metalAmount * (updated.making_charge_value / 100)
        : Number(updated.making_charge_value);

    updated.total_amount = metalAmount + makingAmount;
    onChange(updated);
  };

  const handleChange = (field, value) => {
    const updated = { ...item, [field]: value };
    calculate(updated);
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
      <input
        placeholder="Item Name"
        onChange={(e) => handleChange("item_name", e.target.value)}
      />
      <select onChange={(e) => handleChange("metal", e.target.value)}>
        <option value="gold">Gold</option>
        <option value="silver">Silver</option>
      </select>

      <input
        placeholder="Purity (22K)"
        onChange={(e) => handleChange("purity", e.target.value)}
      />

      <input
        type="number"
        placeholder="Weight (g)"
        onChange={(e) => handleChange("weight_grams", e.target.value)}
      />

      <input
        type="number"
        placeholder="Rate / 10g"
        onChange={(e) => handleChange("rate_per_10g", e.target.value)}
      />

      <select
        onChange={(e) =>
          handleChange("making_charge_type", e.target.value)
        }
      >
        <option value="fixed">Fixed</option>
        <option value="percent">Percent</option>
      </select>

      <input
        type="number"
        placeholder="Making"
        onChange={(e) =>
          handleChange("making_charge_value", e.target.value)
        }
      />

      <strong>Item Total: ₹{item.total_amount || 0}</strong>
    </div>
  );
};

export default ItemRow;
