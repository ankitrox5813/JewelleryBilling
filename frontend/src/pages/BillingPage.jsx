import BillingForm from "../components/BillingForm";
import { Link, useParams } from "react-router-dom";

const BillingPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  return (
    <div style={{ padding: 20 }}>
     

      {/* Form */}
      <BillingForm />

      {/* Footer Links */}
      {!isEditMode && (
        <div style={{ marginTop: 15 }}>
          {/* <Link to="/bills">View Bills</Link> */}
        </div>
      )}
    </div>
  );
};

export default BillingPage;
