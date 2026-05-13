import React from "react";
import ApiService from "../../service/ApiService";
import { getAvailabilityStatus } from "../../utils/productDisplay";

const ProductListGrid = ({
  products,
  isManagerView,
  isAdmin,
  onSelectProduct,
  onNavigateSupplier,
  onStockIn,
  onStockOut,
  onMovements,
  onEdit,
  onDelete,
}) => (
  <div className={`product-list ${isManagerView ? "product-modern-grid" : ""}`}>
    {products.map((product) => (
      <div
        key={product.id}
        className={`product-item ${isManagerView ? "product-modern-card" : ""}`}
        onClick={() => onSelectProduct(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectProduct(product);
          }
        }}
      >
        <img
          className={`product-image ${isManagerView ? "product-modern-image" : ""}`}
          src={ApiService.getProductImageUrl(product.imageUrl)}
          alt={product.name}
        />

        <div className="product-info">
          <h3 className="name">{product.name}</h3>
          <p className="sku">SKU: {product.sku}</p>
          <p className="supplier">
            Supplier:{" "}
            {isAdmin && product.supplierId ? (
              <button
                type="button"
                className="link-button product-supplier-link"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateSupplier(product.supplierId);
                }}
              >
                {product.supplierName ?? `Supplier #${product.supplierId}`}
              </button>
            ) : (
              <span>{product.supplierName ?? "N/A"}</span>
            )}
          </p>
          <p className="price">Price: ${product.price}</p>
          <p className="quantity">Quantity: {product.stockQuantity}</p>
          <p className="availability">
            Availability:{" "}
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
        </div>

        <div className="product-card-links" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onStockIn(product)}
          >
            Stock-in
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onStockOut(product)}
          >
            Stock-out
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onMovements(product)}
          >
            Movements
          </button>
        </div>

        <div className="product-actions">
          {isAdmin && (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product.id);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product.id);
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default ProductListGrid;
