import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const linkStyle = (path) => ({
    marginRight: 15,
    fontWeight: location.pathname === path ? "bold" : "normal",
    textDecoration: "none",
    color: "#000",
  });

  return (
    <div
      style={{
        padding: "10px 15px",
        borderBottom: "2px solid #000",
        marginBottom: 20,
        background: "#f8f8f8",
      }}
    >
      <b style={{ marginRight: 20 }}>Jewellery Shop</b>

      <Link to="/" style={linkStyle("/")}>
        ➕ New Bill
      </Link>

      <Link to="/bills/search" style={linkStyle("/bills/search")}>
        🔍 Search
      </Link>

      <Link to="/customers" style={linkStyle("/customers")}>
        👤 Customers
      </Link>

      <Link to="/bills" style={linkStyle("/bills")}>
        📋 Bills
      </Link>

      <Link to="/reports/daily" style={linkStyle("/reports/daily")}>
        📊 Daily Report
      </Link>

      <Link to="/gold-loans" style={linkStyle("/gold-loans")}>
        🏦 Gold Loans
      </Link>
    </div>
  );
};

export default Header;
