import BillingForm from "../components/BillingForm";
import { Link } from "react-router-dom";

const BillingPage = () => {
  return (
    <div style={{ padding: 20 }}>
      
      <BillingForm />
      <Link to="/bills">View Bills</Link>
      
    </div>
  );
};

export default BillingPage;
