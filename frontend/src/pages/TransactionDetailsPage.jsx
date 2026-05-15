/* global globalThis */
import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const TransactionDetailsPage = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [updateRequests, setUpdateRequests] = useState([]);
  const navigate = useNavigate();
  const isAdmin = ApiService.isAdmin();

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  useEffect(() => {
    const getTransaction = async () => {
      try {
        const transactionData = await ApiService.getTransactionById(transactionId);
        if (transactionData.status === 200) {
          setTransaction(transactionData.transaction);
          setStatus(String(transactionData.transaction.status ?? ""));
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error getting transaction: " + error
        );
      }
    };
    getTransaction();
  }, [transactionId, isAdmin]);

  const loadUpdateRequests = async () => {
    if (!isAdmin) return;
    try {
      const requestData = await ApiService.getTransactionUpdateRequests(transactionId);
      if (requestData.status === 200) {
        setUpdateRequests(requestData.transactionUpdateRequests || []);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error loading update requests: " + error
      );
    }
  };

  const handleUpdateStatus = async () => {
    if (!isAdmin) {
      showMessage("Only administrators can update transaction details.");
      return;
    }
    try {
      await ApiService.updateTransactionStatus(transactionId, status);
      showMessage("Status updated.");
      setTimeout(() => navigate("/transaction"), 700);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error updating transaction: " + error
      );
    }
  };

  const handleRequestUpdate = async () => {
    if (isAdmin) return;
    const trimmedMessage = requestMessage.trim();
    if (!trimmedMessage) {
      showMessage("Please describe the change you want to request.");
      return;
    }
    try {
      await ApiService.requestTransactionUpdate(transactionId, trimmedMessage);
      showMessage("Update request sent to admin.");
      setRequestMessage("");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error sending update request: " + error
      );
    }
  };

  const handleVoidTransaction = async () => {
    if (!isAdmin) return;
    const ok = globalThis.confirm(
      "Void this transaction?\n\n" +
        "Status will be set to CANCELLED and inventory will be reversed:\n" +
        "• Purchase → stock decreases\n" +
        "• Sale / Return → stock increases\n\n" +
        "This cannot be undone from the UI."
    );
    if (!ok) return;
    try {
      await ApiService.updateTransactionStatus(transactionId, "CANCELLED");
      showMessage("Transaction voided; stock reversed.");
      setStatus("CANCELLED");
      const transactionData = await ApiService.getTransactionById(transactionId);
      if (transactionData.status === 200) {
        setTransaction(transactionData.transaction);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error voiding transaction: " + error
      );
    }
  };

  const goToProductCatalog = () => {
    const id = transaction?.product?.id;
    if (!id) return;
    navigate("/product", { state: { focusProductId: id } });
  };

  const handleEditNavigation = () => {
    if (isAdmin) {
      navigate(`/update-transaction/${transactionId}`);
      return;
    }
    document.getElementById("transaction-update-request")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const priceText = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(2) : "—";
  };

  return (
    <Layout>
      {message && <p className="message">{message}</p>}
      <div className="transaction-details-page transaction-details-modern">
        {transaction && (
          <>
            <div className="transaction-details-toolbar">
              <div className="transaction-details-toolbar-left">
                <button type="button" className="btn btn-ghost btn-md" onClick={() => navigate("/transaction")}>
                  ← Back to transactions
                </button>
                {transaction.product?.id && (
                  <button type="button" className="btn btn-secondary btn-md" onClick={goToProductCatalog}>
                    Open in product catalog
                  </button>
                )}
              </div>
              <div className="transaction-details-toolbar-right">
                {isAdmin ? (
                  <button type="button" className="btn btn-secondary btn-md" onClick={handleEditNavigation}>
                    Edit transaction
                  </button>
                ) : (
                  <button type="button" className="btn btn-secondary btn-md" onClick={handleEditNavigation}>
                    Request update from admin
                  </button>
                )}
                {isAdmin && String(transaction.status) !== "CANCELLED" && (
                  <button type="button" className="btn btn-danger btn-md" onClick={handleVoidTransaction}>
                    Delete transaction
                  </button>
                )}
              </div>
            </div>

            <div className="section-card">
              <h2>Transaction information</h2>
              <p>
                <span className="label">Type:</span> {transaction.transactionType}
              </p>
              <p>
                <span className="label">Status:</span> {transaction.status}
              </p>
              <p>
                <span className="label">Description:</span> {transaction.description ?? "—"}
              </p>
              <p>
                <span className="label">Note:</span> {transaction.note ?? "—"}
              </p>
              <p>
                <span className="label">Total products:</span> {transaction.totalProducts}
              </p>
              <p>
                <span className="label">Total price:</span> ${priceText(transaction.totalPrice)}
              </p>
              <p>
                <span className="label">Created:</span> {new Date(transaction.createdAt).toLocaleString()}
              </p>
              {(transaction.updateAt || transaction.updatedAt) && (
                <p>
                  <span className="label">Updated:</span>{" "}
                  {new Date(transaction.updateAt || transaction.updatedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="section-card">
              <h2>Product information</h2>
              {transaction.product ? (
                <>
                  <p>
                    <span className="label">Name:</span> {transaction.product.name}
                  </p>
                  <p>
                    <span className="label">SKU:</span> {transaction.product.sku}
                  </p>
                  <p>
                    <span className="label">Price:</span> ${priceText(transaction.product.price)}
                  </p>
                  <p>
                    <span className="label">Stock quantity:</span> {transaction.product.stockQuantity}
                  </p>
                  <p>
                    <span className="label">Description:</span> {transaction.product.description ?? "—"}
                  </p>
                  {transaction.product.imageUrl && (
                    <img
                      src={ApiService.getProductImageUrl(transaction.product.imageUrl)}
                      alt={transaction.product.name}
                    />
                  )}
                  <div className="transaction-entity-links">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        navigate("/product", {
                          state: { focusProductId: transaction.product.id },
                        })
                      }
                    >
                      Open in catalog
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        navigate("/transaction", {
                          state: { focusProductId: transaction.product.id },
                        })
                      }
                    >
                      All movements for product
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        navigate("/stock-in", {
                          state: {
                            productId: transaction.product.id,
                            supplierId: transaction.supplier?.id,
                          },
                        })
                      }
                    >
                      New stock-in
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        navigate("/stock-out", {
                          state: { productId: transaction.product.id },
                        })
                      }
                    >
                      New stock-out
                    </button>
                  </div>
                </>
              ) : (
                <p className="muted-text">No product data on this record.</p>
              )}
            </div>

            <div className="section-card">
              <h2>User information</h2>
              {transaction.user ? (
                <>
                  <p>
                    <span className="label">Name:</span> {transaction.user.name}
                  </p>
                  <p>
                    <span className="label">Email:</span> {transaction.user.email}
                  </p>
                  <p>
                    <span className="label">Phone:</span> {transaction.user.phoneNumber ?? "—"}
                  </p>
                  <p>
                    <span className="label">Role:</span> {transaction.user.role}
                  </p>
                </>
              ) : (
                <p className="muted-text">User details are not available on this record.</p>
              )}
            </div>

            {transaction.supplier && (
              <div className="section-card">
                <h2>Supplier information</h2>
                <p>
                  <span className="label">Name:</span> {transaction.supplier.name}
                </p>
                <p>
                  <span className="label">Contact:</span> {transaction.supplier.contactInfo ?? "—"}
                </p>
                <p>
                  <span className="label">Email:</span>{" "}
                  {(
                    transaction.supplier.email ??
                    transaction.supplier.Email ??
                    transaction.supplier.supplierEmail ??
                    ""
                  )
                    .toString()
                    .trim() || "—"}
                </p>
                <p>
                  <span className="label">Phone:</span> {transaction.supplier.phone?.trim() || "—"}
                </p>
                <p>
                  <span className="label">Address:</span> {transaction.supplier.address ?? "—"}
                </p>
                <div className="transaction-entity-links">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      navigate("/transaction", {
                        state: { focusSupplierId: transaction.supplier.id },
                      })
                    }
                  >
                    All movements for supplier
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      navigate("/stock-in", { state: { supplierId: transaction.supplier.id } })
                    }
                  >
                    Stock-in for supplier
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          navigate("/supplier", {
                            state: { focusSupplierId: transaction.supplier.id },
                          })
                        }
                      >
                        Open supplier
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/edit-supplier/${transaction.supplier.id}`)}
                      >
                        Edit supplier
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="section-card transaction-status-update">
              <h2>Update status</h2>
              {String(transaction.status) === "CANCELLED" ? (
                <p className="muted-text transaction-voided-banner">
                  This transaction is <strong>voided (CANCELLED)</strong>. Inventory was reversed when it was
                  cancelled. Status cannot be changed.
                </p>
              ) : (
                <>
                  <p className="muted-text transaction-status-hint">
                    Only administrators can change transaction details directly. Managers should submit a
                    request for review.
                  </p>
                  <div className="transaction-status-row">
                    <label htmlFor="tx-status-select">Status</label>
                    <select
                      id="tx-status-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      {isAdmin && <option value="CANCELLED">CANCELLED (void)</option>}
                    </select>
                    <button type="button" className="btn btn-primary btn-md" onClick={handleUpdateStatus}>
                      Update status
                    </button>
                  </div>
                  {isAdmin && (
                    <div className="transaction-void-actions">
                      <button type="button" className="btn btn-danger btn-md" onClick={handleVoidTransaction}>
                        Void transaction (cancel &amp; reverse stock)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {!isAdmin && (
              <div className="section-card" id="transaction-update-request">
                <h2>Request transaction update</h2>
                <p className="muted-text">
                  Managers cannot change transaction records directly. Send a request to Admin with the
                  changes you need.
                </p>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Describe the update you want Admin to make..."
                  rows={5}
                  style={{ width: "100%", marginBottom: 12 }}
                />
                <button type="button" className="btn btn-primary btn-md" onClick={handleRequestUpdate}>
                  Send request to admin
                </button>
              </div>
            )}

            {isAdmin && updateRequests.length > 0 && (
              <div className="section-card">
                <h2>Update requests</h2>
                {updateRequests.map((request) => (
                  <div key={request.id} className="transaction-request-item" style={{ marginBottom: 12 }}>
                    <p>
                      <strong>{request.requesterName}</strong> ({request.requesterRole})
                    </p>
                    <p className="muted-text">{request.requestMessage}</p>
                    <p className="muted-text">
                      Requested: {request.createdAt ? new Date(request.createdAt).toLocaleString() : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {isAdmin && updateRequests.length === 0 && (
              <div className="section-card">
                <h2>Update requests</h2>
                <p className="muted-text">No update requests loaded yet.</p>
                <button type="button" className="btn btn-secondary btn-md" onClick={loadUpdateRequests}>
                  Load update requests
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default TransactionDetailsPage;
