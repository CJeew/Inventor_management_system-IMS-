import React from "react";
import Layout from "../component/Layout";

const StockLocationsPage = () => {
  return (
    <Layout>
      <div className="page-shell">
        <div className="page-header">
          <h1>Stock Locations</h1>
          <p className="page-subtitle">
            Track where items are stored (warehouse, aisle, rack, bin).
          </p>
        </div>

        <div className="empty-state">
          <div className="empty-state-card">
            <h2>Stock location section</h2>
            <p>
              Sidebar button and route are set. Next step is wiring this to your
              backend stock-location API (if you have one).
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StockLocationsPage;
