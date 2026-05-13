import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Posted transactions cannot change quantity/description on the server in this API version.
 * This page summarizes the line and links to details / stock flows for corrections.
 */
const UpdateTransactionPage = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await ApiService.getTransactionById(transactionId);
        if (response.status === 200) {
          setTransaction(response.transaction);
        }
      } catch (error) {
        showMessage(error.response?.data?.message || "Error loading transaction");
      }
    };
    fetchTransaction();
  }, [transactionId]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
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

  const typ = String(transaction.transactionType || "").toUpperCase();

  return (
    <Layout>
      <div className="purchase-form-page purchase-form-modern stock-io-page">
        {message && <div className="message">{message}</div>}

        <h1>Update transaction</h1>
        <div className="transaction-update-info">
          <p>
            <strong>#{transaction.id}</strong> · {transaction.transactionType} ·{" "}
            {transaction.status}
          </p>
          <p className="muted-text">
            The backend only supports <strong>status</strong> changes (and admin void with stock reversal).
            Quantities and pricing on an existing row cannot be edited here. Use{" "}
            <strong>Stock-in</strong> / <strong>Stock-out</strong> for new movements, or open{" "}
            <strong>Details</strong> to update status or void (admin).
          </p>
        </div>

        <div className="section-card" style={{ marginBottom: 16 }}>
          <p>
            <span className="label">Product:</span> {transaction.product?.name || "—"}
          </p>
          <p>
            <span className="label">Quantity:</span> {transaction.totalProducts}
          </p>
          <p>
            <span className="label">Description:</span> {transaction.description ?? "—"}
          </p>
          <p>
            <span className="label">Note:</span> {transaction.note ?? "—"}
          </p>
        </div>

        <div className="stock-io-actions">
          <button type="button" className="btn btn-ghost btn-md" onClick={() => navigate(-1)}>
            Back
          </button>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => navigate(`/transaction/${transactionId}`)}
          >
            Open details
          </button>
          {typ === "PURCHASE" && (
            <button type="button" className="btn btn-secondary btn-md" onClick={() => navigate("/stock-in")}>
              New stock-in
            </button>
          )}
          {typ === "SALE" && (
            <button type="button" className="btn btn-secondary btn-md" onClick={() => navigate("/stock-out")}>
              New stock-out
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UpdateTransactionPage;
