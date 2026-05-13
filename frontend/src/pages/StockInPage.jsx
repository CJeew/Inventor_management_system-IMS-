import React, { useState, useEffect, useMemo } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useLocation } from "react-router-dom";
import { normalizeSupplierRow } from "../utils/normalizeSupplier";

const StockInPage = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [productId, setProductId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const s = location.state;
    if (!s?.productId && !s?.supplierId) return;
    if (s.productId) setProductId(String(s.productId));
    if (s.supplierId) setSupplierId(String(s.supplierId));
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const fetchProductsAndSuppliers = async () => {
      try {
        const [productData, supplierData] = await Promise.all([
          ApiService.getAllProducts(),
          ApiService.getAllSuppliers(),
        ]);
        setProducts(productData.products || []);
        setSuppliers((supplierData.suppliers || []).map(normalizeSupplierRow));
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error fetching data: " + error
        );
      }
    };
    fetchProductsAndSuppliers();
  }, []);

  useEffect(() => {
    if (!productId) return;
    const p = products.find((x) => String(x.id) === String(productId));
    if (p?.supplierId) {
      const sid = String(p.supplierId);
      if (suppliers.some((s) => String(s.id) === sid)) setSupplierId(sid);
    }
  }, [productId, products, suppliers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productId || !supplierId || !quantity) {
      showMessage("Please fill in all required fields");
      return;
    }
    if (parseInt(quantity, 10) <= 0) {
      showMessage("Quantity must be a positive number");
      return;
    }
    setIsConfirming(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setLastTransactionId(null);
    const body = {
      productId,
      quantity: parseInt(quantity, 10),
      supplierId,
      description: description || "Stock in",
      note: note || "",
    };
    try {
      const response = await ApiService.stockInProduct(body);
      showMessage(response.message || "Stock recorded.");
      if (response.transaction?.id) setLastTransactionId(response.transaction.id);
      resetForm();
      setIsConfirming(false);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error recording stock-in: " + error
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductId("");
    setSupplierId("");
    setDescription("");
    setNote("");
    setQuantity("");
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === String(productId)),
    [products, productId]
  );
  const selectedSupplier = useMemo(
    () => suppliers.find((s) => String(s.id) === String(supplierId)),
    [suppliers, supplierId]
  );

  return (
    <Layout>
      <div className="purchase-form-page purchase-form-modern stock-io-page">
        {message && <div className="message">{message}</div>}
        {lastTransactionId && (
          <div className="message" style={{ background: "#e0f2fe", color: "#075985" }}>
            Receipt saved.{" "}
            <button
              type="button"
              className="link-button"
              style={{ color: "#0369a1", fontWeight: 700 }}
              onClick={() => navigate(`/transaction/${lastTransactionId}`)}
            >
              View transaction #{lastTransactionId}
            </button>
          </div>
        )}

        <h1>Record stock-in</h1>
        <p className="form-page-hint">
          Receive inventory from a supplier (same as a purchase). Stock increases after you confirm.
        </p>

        {!isConfirming ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="stockin-product">
                Product <span className="required-star">*</span>
              </label>
              <select
                id="stockin-product"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (SKU: {product.sku}) — stock {product.stockQuantity ?? 0}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="stockin-supplier">
                Supplier <span className="required-star">*</span>
              </label>
              <select
                id="stockin-supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
              >
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="stockin-qty">
                Quantity <span className="required-star">*</span>
              </label>
              <input
                id="stockin-qty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                placeholder="Units received"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stockin-desc">Description</label>
              <input
                id="stockin-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly restock"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stockin-note">Notes</label>
              <textarea
                id="stockin-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional details"
                rows={3}
              />
            </div>

            <div className="stock-io-actions">
              <button type="button" className="btn btn-ghost btn-md" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-md">
                Review
              </button>
            </div>
          </form>
        ) : (
          <div className="stock-io-confirm">
            <h2>Confirm stock-in</h2>
            <ul className="stock-io-confirm-list">
              <li>
                <span>Product</span> <strong>{selectedProduct?.name}</strong>
              </li>
              <li>
                <span>Supplier</span> <strong>{selectedSupplier?.name}</strong>
              </li>
              <li>
                <span>Quantity</span> <strong>+{quantity}</strong>
              </li>
              <li>
                <span>Description</span> <strong>{description || "—"}</strong>
              </li>
              {note && (
                <li>
                  <span>Note</span> <strong>{note}</strong>
                </li>
              )}
            </ul>
            <p className="form-page-hint">
              This will increase stock for <strong>{selectedProduct?.name}</strong> by{" "}
              <strong>{quantity}</strong> units.
            </p>
            <div className="stock-io-actions">
              <button
                type="button"
                className="btn btn-ghost btn-md"
                onClick={() => setIsConfirming(false)}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? "Saving…" : "Confirm & save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StockInPage;
