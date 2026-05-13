import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ApiService from "../service/ApiService";
import logo from "../logo.png";

const DASHBOARD_HOME_EVENT = "ims-dashboard-reset-home";

const logout = () => {
  ApiService.logout();
};

const I = ({ children, ...props }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    {children}
  </svg>
);

const IconDashboard = () => (
  <I aria-hidden>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </I>
);

const IconTransactions = () => (
  <I aria-hidden>
    <path d="M4 19V5M8 19V10M12 19v-6M16 19V8M20 19V12" strokeLinecap="round" />
  </I>
);

const IconCategory = () => (
  <I aria-hidden>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />
  </I>
);

const IconProduct = () => (
  <I aria-hidden>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
  </I>
);

const IconSupplier = () => (
  <I aria-hidden>
    <path d="M1 3h15v11H1zM16 8h4l3 3v3h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
  </I>
);

const IconStockIn = () => (
  <I aria-hidden>
    <path d="M12 3v12" strokeLinecap="round" />
    <path d="M8 11l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 21h14" strokeLinecap="round" />
  </I>
);

const IconStockOut = () => (
  <I aria-hidden>
    <path d="M12 21V9" strokeLinecap="round" />
    <path d="M8 13l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 21h14" strokeLinecap="round" />
  </I>
);

const IconReport = () => (
  <I aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </I>
);

const IconWarehouse = () => (
  <I aria-hidden>
    <path d="M3 9l9-7 9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9zM9 22V12h6v10" />
  </I>
);

const IconPin = () => (
  <I aria-hidden>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none" />
  </I>
);

const IconProfile = () => (
  <I aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </I>
);

const IconLogout = () => (
  <I aria-hidden>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
  </I>
);

const MAIN_NAV = [
  { to: "/dashboard", label: "Dashboard", end: true, icon: IconDashboard },
  { to: "/transaction", label: "Transactions", icon: IconTransactions },
  { to: "/category", label: "Category", icon: IconCategory },
  { to: "/product", label: "Product", icon: IconProduct },
  { to: "/supplier", label: "Supplier", icon: IconSupplier },
  { to: "/stock-in", label: "Stock-in", icon: IconStockIn },
  { to: "/stock-out", label: "Stock-out", icon: IconStockOut },
  { to: "/transaction-report", label: "Transaction report", icon: IconReport },
  { to: "/warehouse", label: "Warehouse", icon: IconWarehouse },
  { to: "/stock-locations", label: "Stock Locations", icon: IconPin },
  { to: "/profile", label: "Profile", icon: IconProfile },
];

const Sidebar = () => {
  const isAuth = ApiService.isAuthenticated();
  const location = useLocation();

  const handleDashboardBrandClick = (e) => {
    if (location.pathname === "/dashboard") {
      e.preventDefault();
      window.dispatchEvent(new Event(DASHBOARD_HOME_EVENT));
    }
  };

  return (
    <div className="sidebar">
      <Link
        to="/dashboard"
        className="sidebar-brand sidebar-brand-link"
        onClick={handleDashboardBrandClick}
        aria-label="StockSmart — go to dashboard overview"
      >
        <img className="sidebar-logo" src={logo} alt="" />
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">StockSmart</div>
          <div className="sidebar-brand-sub">Inventory System</div>
        </div>
      </Link>
      {isAuth && (
        <nav className="sidebar-nav" aria-label="Main navigation">
          <ul className="sidebar-nav-list">
            {MAIN_NAV.map(({ to, label, end, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) => `sidebar-nav-link${isActive ? " is-active" : ""}`}
                >
                  <span className="sidebar-nav-icon" aria-hidden>
                    <Icon />
                  </span>
                  <span className="sidebar-nav-label">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {isAuth && (
        <div className="sidebar-footer">
          <Link className="sidebar-logout-link" onClick={logout} to="/login">
            <span className="sidebar-nav-icon" aria-hidden>
              <IconLogout />
            </span>
            <span className="sidebar-nav-label">Logout</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
