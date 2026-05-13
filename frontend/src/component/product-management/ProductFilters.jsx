import React from "react";

const ProductFilters = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  searchValue,
  onSearchValueChange,
  isSearching,
  onSearch,
  onClearSearch,
  isAdmin,
  onDownloadPdf,
  onAddProduct,
}) => (
  <div className="product-header-actions">
    <div className="product-filters">
      <label htmlFor="category-filter" className="product-filter-label">
        Category
      </label>
      <select
        id="category-filter"
        className="product-category-filter"
        value={selectedCategoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
    <div className="product-search">
      <input
        type="text"
        placeholder="Search products..."
        value={searchValue}
        onChange={(e) => onSearchValueChange(e.target.value)}
      />
      <button type="button" className="btn btn-primary btn-md" onClick={onSearch}>
        Search
      </button>
      {isSearching && (
        <button type="button" className="btn btn-ghost btn-md" onClick={onClearSearch}>
          Clear
        </button>
      )}
    </div>
    {isAdmin && (
      <>
        <button type="button" className="btn btn-secondary btn-md" onClick={onDownloadPdf}>
          Download PDF
        </button>
        <button type="button" className="btn btn-primary btn-md" onClick={onAddProduct}>
          Add Product
        </button>
      </>
    )}
  </div>
);

export default ProductFilters;
