import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/customers").then((res) => setCustomers(res.data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Customers</h2>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-100">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-center">Total Bills</th>
              <th className="px-4 py-3 text-right">Total Due</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/customers/${c.id}`)}
                className={`border-t cursor-pointer transition
                  hover:bg-amber-50
                  ${Number(c.total_due) > 0 ? "bg-yellow-50" : ""}
                `}
              >
                {/* Name */}
                <td className="px-4 py-3 font-medium text-blue-600">
                  {c.name}
                </td>

                {/* Phone */}
                <td className="px-4 py-3">{c.phone}</td>

                {/* Bills */}
                <td className="px-4 py-3 text-center">
                  {c.total_bills}
                </td>

                {/* Due */}
                <td className="px-4 py-3 text-right font-semibold">
                  ₹{Number(c.total_due).toFixed(2)}
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500"
                >
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== LEGEND ===== */}
      <div className="mt-4 text-sm">
        <span className="inline-block px-3 py-1 bg-yellow-50 border rounded mr-2">
          Pending Due
        </span>
        <span className="inline-block px-3 py-1 border rounded">
          Clear
        </span>
      </div>
    </div>
  );
};

export default CustomerList;
