import { BrowserRouter, Routes, Route } from "react-router-dom";

import BillingPage from "./pages/BillingPage";
import BillList from "./pages/BillList";
import CustomerProfile from "./pages/CustomerProfile";
import DailyReport from "./pages/DailyReport";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BillingPage />} />
        <Route path="/bills" element={<BillList />} />
        <Route path="/customers/:id" element={<CustomerProfile />} />
        <Route path="/reports/daily" element={<DailyReport />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
