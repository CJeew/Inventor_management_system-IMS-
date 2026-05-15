import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const UpdateTransactionPage = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    status: "",
    description: "",
    note: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await ApiService.getTransactionById(transactionId);
        if (response.status === 200) {
          setTransaction(response.transaction);
          setForm({
            productId: String(response.transaction.product?.id ?? ""),
            quantity: String(response.transaction.totalProducts ?? ""),
            status: String(response.transaction.status ?? ""),
            description: response.transaction.description ?? "",
            note: response.transaction.note ?? "",
          });
        }
      } catch (error) {
        showMessage(error.response?.data?.message || "Error loading transaction");
      }
    };
    fetchTransaction();
  }, [transactionId]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ApiService.getAllProducts();
        if (response.status === 200) {
          setProducts(response.products || []);
        }
      } catch (error) {
        showMessage(error.response?.data?.message || "Error loading products");
      }
    };
    fetchProducts();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await ApiService.updateTransactionDetails(transactionId, {
        productId: Number(form.productId),
        quantity: Number(form.quantity),
        status: form.status,
        description: form.description,
        note: form.note,
      });
      showMessage("Transaction updated successfully.");
      setTimeout(() => navigate(`/transaction/${transactionId}`), 700);
    } catch (error) {
      showMessage(error.response?.data?.message || "Error updating transaction");
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) {
    return (
      <Layout>
        <div className="purchase-form-page purchase-form-modern">
          <p className="muted-text">Loading…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="purchase-form-page purchase-form-modern stock-io-page transaction-edit-page">
        {message && <div className="message">{message}</div>}

        <div className="transaction-edit-hero">
          <div className="transaction-edit-hero-copy">
            <p className="transaction-edit-kicker">Admin edit workspace</p>
            <h1>Update transaction</h1>
            <p className="transaction-update-info">
              Edit the record details, product, quantity, and workflow state. Inventory changes are applied
              automatically when you save.
            </p>
          </div>

          <div className="transaction-edit-badges">
            <span className="transaction-edit-badge">#{transaction.id}</span>
            <span className="transaction-edit-badge transaction-edit-badge--type">
              {transaction.transactionType}
            </span>
            <span className="transaction-edit-badge transaction-edit-badge--status">
              {transaction.status}
            </span>
          </div>
        </div>

        <div className="transaction-edit-summary-grid">
          <div className="transaction-edit-summary-card">
            <span className="transaction-edit-summary-label">Current product</span>
            <strong>{transaction.product?.name || "—"}</strong>
            <span>{transaction.product?.sku || "No SKU"}</span>
          </div>
          <div className="transaction-edit-summary-card">
            <span className="transaction-edit-summary-label">Current quantity</span>
            <strong>{transaction.totalProducts}</strong>
            <span>Inventory history will be recalculated</span>
          </div>
          <div className="transaction-edit-summary-card">
            <span className="transaction-edit-summary-label">Current total</span>
            <strong>${Number(transaction.totalPrice ?? 0).toFixed(2)}</strong>
            <span>Recomputed on save</span>
          </div>
        </div>

        <form className="transaction-edit-form section-card" onSubmit={(e) => e.preventDefault()}>
          <div className="transaction-edit-form-grid">
            <div className="transaction-edit-panel">
              <h2>Core details</h2>
              <p className="muted-text transaction-edit-panel-note">
                Choose the product and quantity. The backend will reconcile stock when the record changes.
              </p>

              <div className="stock-io-form-group">
                <label htmlFor="tx-edit-product">Product</label>
                <select
                  id="tx-edit-product"
                  value={form.productId}
                  onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} {product.sku ? `(${product.sku})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="stock-io-form-group">
                <label htmlFor="tx-edit-quantity">Quantity</label>
                <input
                  id="tx-edit-quantity"
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                />
              </div>

              <div className="transaction-edit-help">
                <strong>Tip:</strong> Changing the product or quantity will update stock automatically based on
                the transaction type.
              </div>
            </div>

            <div className="transaction-edit-panel">
              <h2>Status and notes</h2>
              <p className="muted-text transaction-edit-panel-note">
                Keep the workflow status and narrative fields aligned with the actual transaction.
              </p>

              <div className="stock-io-form-group">
                <label htmlFor="tx-edit-status">Status</label>
                <select
                  id="tx-edit-status"
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="stock-io-form-group">
                <label htmlFor="tx-edit-description">Description</label>
                <textarea
                  id="tx-edit-description"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="stock-io-form-group">
                <label htmlFor="tx-edit-note">Note</label>
                <textarea
                  id="tx-edit-note"
                  value={form.note}
                  onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="stock-io-actions transaction-edit-actions">
            <button type="button" className="btn btn-ghost btn-md" onClick={() => navigate(-1)}>
              Back
            </button>
            <button type="button" className="btn btn-primary btn-md" disabled={loading} onClick={handleSubmit}>
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UpdateTransactionPage;
