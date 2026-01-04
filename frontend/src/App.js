import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";

import BillingPage from "./pages/BillingPage";
import BillList from "./pages/BillList";
import BillSearch from "./pages/BillSearch";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerList from "./pages/CustomerList";
import DailyReport from "./pages/DailyReport";
import GoldLoanList from "./pages/GoldLoanList";
import GoldLoanCreate from "./pages/GoldLoanCreate";
import GoldLoanDetails from "./pages/GoldLoanDetails";
import BillingForm from "./components/BillingForm";
import BillDetails from "./pages/BillDetails";

function App() {
  return (
    <BrowserRouter>
      <Header /> {/* ✅ Common header */}

      <Routes>
       {/* Billing */}
        <Route path="/" element={<BillingPage />} />
        <Route path="/bills" element={<BillList />} />
        <Route path="/bills/:id" element={<BillDetails />} />
        <Route path="/bills/search" element={<BillSearch />} />
        <Route path="/bills/:id/edit" element={<BillingForm />} />

        {/* Customers */}
        <Route path="/customers" element={<CustomerList />} />     {/* ✅ */}
        <Route path="/customers/:id" element={<CustomerProfile />} /> {/* ✅ */}

        {/* Reports */}
        <Route path="/reports/daily" element={<DailyReport />} />

        {/* Gold Loans */}
        <Route path="/gold-loans" element={<GoldLoanList />} />
        <Route path="/gold-loans/new" element={<GoldLoanCreate />} />
        <Route path="/gold-loans/:id" element={<GoldLoanDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
