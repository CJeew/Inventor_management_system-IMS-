import React from "react";
import { Link, useLocation } from "react-router-dom";
import ApiService from "../service/ApiService";
import logo from "../logo.png";

const DASHBOARD_HOME_EVENT = "ims-dashboard-reset-home";

const logout = () => {
  ApiService.logout();
};

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
          <ul className="nav-links">
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/transaction">Transactions</Link>
            </li>
            <li>
              <Link to="/category">Category</Link>
            </li>
            <li>
              <Link to="/product">Product</Link>
            </li>
            <li>
              <Link to="/supplier">Supplier</Link>
            </li>
            <li>
              <Link to="/stock-in">Stock-in</Link>
            </li>
            <li>
              <Link to="/stock-out">Stock-out</Link>
            </li>
            <li>
              <Link to="/transaction-report">Transaction report</Link>
            </li>
            <li>
              <Link to="/warehouse">Warehouse</Link>
            </li>
            <li>
              <Link to="/stock-locations">Stock Locations</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
          </ul>
        </nav>
      )}
      {isAuth && (
        <div className="sidebar-footer">
          <ul className="nav-links">
            <li>
              <Link onClick={logout} to="/login">
                Logout
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
