import React from "react";

const ProductEmptyState = ({ isAdmin, onAddProduct }) => (
  <div className="empty-state">
    <div className="empty-state-card">
      <h3>No products found</h3>
      <p className="muted-text">
        Try clearing the search, changing the category, or adding a new product.
      </p>
      {isAdmin && (
        <button
          type="button"
          className="btn btn-primary btn-md"
          onClick={onAddProduct}
          style={{ maxWidth: 220, marginTop: 10 }}
        >
          Add Product
        </button>
      )}
    </div>
  </div>
);

export default ProductEmptyState;
