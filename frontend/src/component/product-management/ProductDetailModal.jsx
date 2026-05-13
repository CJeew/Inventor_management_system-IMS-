import React from "react";
import ApiService from "../../service/ApiService";
import { getAvailabilityStatus } from "../../utils/productDisplay";

const ProductDetailModal = ({
  product,
  isAdmin,
  onClose,
  onNavigateSupplier,
  onStockIn,
  onStockOut,
  onMovements,
  onEdit,
  onDelete,
}) => (
  <div className="product-modal-backdrop" onClick={onClose}>
    <div className="product-modal-card" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="product-modal-close" aria-label="Close" onClick={onClose}>
        ×
      </button>

      <div className="product-modal-header">
        <img
          className="product-modal-image"
          src={ApiService.getProductImageUrl(product.imageUrl)}
          alt={product.name}
        />
      </div>

      <div className="product-modal-body">
        <h2>{product.name}</h2>
        <p>
          <span className="label">SKU:</span> {product.sku}
        </p>
        <p>
          <span className="label">Supplier:</span>{" "}
          {isAdmin && product.supplierId ? (
            <button
              type="button"
              className="link-button"
              onClick={() => {
                onNavigateSupplier(product.supplierId);
                onClose();
              }}
            >
              {product.supplierName ?? `Supplier #${product.supplierId}`}
            </button>
          ) : (
            <span>{product.supplierName ?? "N/A"}</span>
          )}
        </p>
        <p>
          <span className="label">Price:</span> ${product.price}
        </p>
        <p>
          <span className="label">Quantity:</span> {product.stockQuantity}
        </p>
        <p>
          <span className="label">Availability:</span>{" "}
          <span
            className={
              Number(product.stockQuantity) > 0
                ? "availability-badge in-stock"
                : "availability-badge out-of-stock"
            }
          >
            {getAvailabilityStatus(product.stockQuantity)}
          </span>
        </p>
        {product.description && (
          <p>
            <span className="label">Description:</span> {product.description}
          </p>
        )}
        {product.expiryDate && (
          <p>
            <span className="label">Expiry Date:</span>{" "}
            {new Date(product.expiryDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="product-modal-connections" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            onStockIn(product);
            onClose();
          }}
        >
          Stock-in
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            onStockOut(product);
            onClose();
          }}
        >
          Stock-out
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            onMovements(product);
            onClose();
          }}
        >
          Movements
        </button>
      </div>

      {isAdmin && (
        <div className="product-modal-footer">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              onEdit(product.id);
              onClose();
            }}
          >
            Edit Product
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => {
              onDelete(product.id);
              onClose();
            }}
          >
            Delete Product
          </button>
        </div>
      )}
    </div>
  </div>
);

export default ProductDetailModal;
