import React from "react";

const ProductManagerTopbar = ({ userProfile, onNavigate }) => (
  <div className="product-modern-topbar">
    <div className="product-modern-nav">
      <button type="button" className="active">
        Products
      </button>
      <button type="button" onClick={() => onNavigate("/dashboard")}>
        Dashboard
      </button>
      <button type="button" onClick={() => onNavigate("/stock-in")}>
        Stock-in
      </button>
      <button type="button" onClick={() => onNavigate("/profile")}>
        Profile
      </button>
    </div>
    <div className="product-modern-profile">
      <span className="role-pill">{userProfile?.role || "MANAGER"}</span>
      <span>{userProfile?.name || "Manager"}</span>
    </div>
  </div>
);

export default ProductManagerTopbar;
