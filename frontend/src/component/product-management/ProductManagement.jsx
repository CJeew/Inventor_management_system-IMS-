import React from "react";
import Layout from "../Layout";
import PaginationComponent from "../PaginationComponent";
import { useProductManagement } from "../../hooks/useProductManagement";
import ProductManagerTopbar from "./ProductManagerTopbar";
import ProductFilters from "./ProductFilters";
import ProductListGrid from "./ProductListGrid";
import ProductEmptyState from "./ProductEmptyState";
import ProductDetailModal from "./ProductDetailModal";

/**
 * Product catalog: list, filters, detail modal, and admin CRUD entry points.
 * The /product route uses ProductPage, which renders this component.
 */
const ProductManagement = () => {
  const {
    products,
    message,
    userProfile,
    searchValue,
    setSearchValue,
    isSearching,
    selectedProduct,
    setSelectedProduct,
    categories,
    selectedCategoryId,
    supplierFilterId,
    currentPage,
    setCurrentPage,
    totalPages,
    isAdmin,
    isManagerView,
    navigate,
    handleDownloadPdf,
    handleDeleteProduct,
    clearSupplierFilter,
    runSearch,
    clearSearch,
    onCategoryChange,
  } = useProductManagement();

  const goSupplier = (supplierId) => {
    navigate("/supplier", { state: { focusSupplierId: supplierId } });
  };

  const stockIn = (product) => {
    navigate("/stock-in", {
      state: {
        productId: product.id,
        supplierId: product.supplierId || undefined,
      },
    });
  };

  const stockOut = (product) => {
    navigate("/stock-out", { state: { productId: product.id } });
  };

  const movements = (product) => {
    navigate("/transaction", { state: { focusProductId: product.id } });
  };

  return (
    <Layout>
      {message && <div className="message">{message}</div>}

      <div className={`product-page ${isManagerView ? "product-modern-shell" : ""}`}>
        {isManagerView && (
          <ProductManagerTopbar userProfile={userProfile} onNavigate={navigate} />
        )}

        <div className="product-header">
          {supplierFilterId != null && (
            <div className="entity-link-banner product-supplier-filter-banner">
              <span>Showing products linked to this supplier.</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={clearSupplierFilter}
              >
                Clear supplier filter
              </button>
            </div>
          )}
          <div className="product-header-top">
            <div className="product-header-title">
              <h1>Products</h1>
              <p className="product-header-subtitle">
                Browse inventory, check availability, and view supplier details.
              </p>
            </div>
            <div className="product-header-meta">
              <span className="count-pill">{`Showing ${products.length}`}</span>
              <span className="count-pill">{isSearching ? "Filtered" : "All"}</span>
            </div>
          </div>

          <ProductFilters
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={onCategoryChange}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            isSearching={isSearching}
            onSearch={runSearch}
            onClearSearch={clearSearch}
            isAdmin={isAdmin}
            onDownloadPdf={handleDownloadPdf}
            onAddProduct={() => navigate("/add-product")}
          />
        </div>

        {products && products.length > 0 && (
          <ProductListGrid
            products={products}
            isManagerView={isManagerView}
            isAdmin={isAdmin}
            onSelectProduct={setSelectedProduct}
            onNavigateSupplier={goSupplier}
            onStockIn={stockIn}
            onStockOut={stockOut}
            onMovements={movements}
            onEdit={(id) => navigate(`/edit-product/${id}`)}
            onDelete={handleDeleteProduct}
          />
        )}

        {products && products.length === 0 && (
          <ProductEmptyState
            isAdmin={isAdmin}
            onAddProduct={() => navigate("/add-product")}
          />
        )}

        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            isAdmin={isAdmin}
            onClose={() => setSelectedProduct(null)}
            onNavigateSupplier={goSupplier}
            onStockIn={stockIn}
            onStockOut={stockOut}
            onMovements={movements}
            onEdit={(id) => navigate(`/edit-product/${id}`)}
            onDelete={handleDeleteProduct}
          />
        )}
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </Layout>
  );
};

export default ProductManagement;
