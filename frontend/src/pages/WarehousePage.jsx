import React from "react";
import Layout from "../component/Layout";

const WarehousePage = () => {
  return (
    <Layout>
      <div className="page-shell">
        <div className="page-header">
          <h1>Warehouses</h1>
          <p className="page-subtitle">
            Manage warehouses and view capacity/location details.
          </p>
        </div>

        <div className="empty-state">
          <div className="empty-state-card">
            <h2>Warehouse section</h2>
            <p>
              This page is ready. Next step is connecting it to your backend
              warehouse API (list/add/edit/delete) if available.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WarehousePage;
