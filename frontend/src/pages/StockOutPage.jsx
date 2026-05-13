import React, { useState, useEffect, useMemo } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useLocation } from "react-router-dom";

const StockOutPage = () => {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
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
    const pid = location.state?.productId;
    if (!pid) return;
    setProductId(String(pid));
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productData = await ApiService.getAllProducts();
        setProducts(productData.products || []);
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error fetching products: " + error
        );
      }
    };
    fetchProducts();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === String(productId)),
    [products, productId]
  );

  const qtyNum = parseInt(quantity, 10);
  const stock = selectedProduct ? Number(selectedProduct.stockQuantity ?? 0) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productId || !quantity) {
      showMessage("Please fill in all required fields");
      return;
    }
    if (Number.isNaN(qtyNum) || qtyNum <= 0) {
      showMessage("Quantity must be a positive number");
      return;
    }
    if (qtyNum > stock) {
      showMessage(`Insufficient stock. Available: ${stock}`);
      return;
    }
    setIsConfirming(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setLastTransactionId(null);
    const body = {
      productId,
      quantity: qtyNum,
      description: description || "Stock out",
      note: note || "",
    };
    try {
      const response = await ApiService.stockOutProduct(body);
      showMessage(response.message || "Stock-out recorded.");
      if (response.transaction?.id) setLastTransactionId(response.transaction.id);
      resetForm();
      setIsConfirming(false);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error recording stock-out: " + error
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductId("");
    setDescription("");
    setNote("");
    setQuantity("");
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  return (
    <Layout>
      <div className="purchase-form-page purchase-form-modern stock-io-page">
        {message && <div className="message">{message}</div>}
        {lastTransactionId && (
          <div className="message" style={{ background: "#e0f2fe", color: "#075985" }}>
            Sale recorded.{" "}
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

        <h1>Record stock-out</h1>
        <p className="form-page-hint">
          Remove stock for sales or issues (same as a sale). Quantity cannot exceed on-hand stock.
        </p>

        {!isConfirming ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="stockout-product">
                Product <span className="required-star">*</span>
              </label>
              <select
                id="stockout-product"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (available: {product.stockQuantity ?? 0})
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <p className="availability-helper">
                  Current stock: <strong>{stock}</strong>
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="stockout-qty">
                Quantity <span className="required-star">*</span>
              </label>
              <input
                id="stockout-qty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                placeholder="Units to remove"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stockout-desc">Description</label>
              <input
                id="stockout-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Daily sale"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stockout-note">Notes</label>
              <textarea
                id="stockout-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Optional"
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
            <h2>Confirm stock-out</h2>
            <ul className="stock-io-confirm-list">
              <li>
                <span>Product</span> <strong>{selectedProduct?.name}</strong>
              </li>
              <li>
                <span>Quantity</span> <strong className="stock-io-qty-neg">−{quantity}</strong>
              </li>
              <li>
                <span>Approx. remaining</span>{" "}
                <strong>{Math.max(0, stock - qtyNum)}</strong>
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
              This will reduce stock for <strong>{selectedProduct?.name}</strong> by{" "}
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
                className="btn btn-danger btn-md"
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

export default StockOutPage;
