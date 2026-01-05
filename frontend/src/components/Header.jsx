import { NavLink } from "react-router-dom";

const base =
  "px-3 py-1.5 rounded-md text-sm font-medium transition-all";

const inactive =
  "text-gray-800 hover:bg-white/40";

const active =
  "bg-white/70 text-gray-900 shadow";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-amber-200/60 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-6">
        {/* Logo / Title */}
        <div className="text-base font-semibold text-amber-900">
          Jewellery Shop
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            ➕ New Bill
          </NavLink>

          <NavLink
            to="/bills/search"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            🔍 Search
          </NavLink>

          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            👤 Customers
          </NavLink>

          <NavLink
            to="/bills"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            📋 Bills
          </NavLink>

          <NavLink
            to="/reports/daily"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            📊 Reports
          </NavLink>

          {/* <NavLink
            to="/gold-loans"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            🏦 Gold Loans
          </NavLink> */}
        </nav>
      </div>
    </header>
  );
};

export default Header;
