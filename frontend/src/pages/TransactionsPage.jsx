import React, { useState, useEffect, useMemo } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, Link, useLocation } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";

const TransactionsPage = () => {
  const [fullList, setFullList] = useState([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const [valueToSearch, setValueToSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = ApiService.isAdmin();

  const [linkFilter, setLinkFilter] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  useEffect(() => {
    const s = location.state;
    if (s?.focusProductId != null) {
      setLinkFilter({ kind: "product", id: Number(s.focusProductId) });
      setCurrentPage(1);
    } else if (s?.focusSupplierId != null) {
      setLinkFilter({ kind: "supplier", id: Number(s.focusSupplierId) });
      setCurrentPage(1);
    }
    if (s?.focusProductId != null || s?.focusSupplierId != null) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const transactionData = await ApiService.getAllTransactions(valueToSearch, 0, 5000);
        if (transactionData.status === 200) {
          setFullList(transactionData.transactions || []);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error loading transactions: " + error
        );
      }
    };
    getTransactions();
  }, [valueToSearch]);

  const filteredByLink = useMemo(() => {
    if (!linkFilter) return fullList;
    if (linkFilter.kind === "product") {
      return fullList.filter((t) => Number(t.product?.id) === linkFilter.id);
    }
    if (linkFilter.kind === "supplier") {
      return fullList.filter((t) => Number(t.supplier?.id) === linkFilter.id);
    }
    return fullList;
  }, [fullList, linkFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredByLink.length / itemsPerPage));
  const transactions = filteredByLink.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const handleSearch = () => {
    setCurrentPage(1);
    setValueToSearch(filter.trim());
  };

  const navigateToTransactionDetailsPage = (transactionId) => {
    navigate(`/transaction/${transactionId}`);
  };

  const goProduct = (productId) => {
    if (!productId) return;
    navigate("/product", { state: { focusProductId: productId } });
  };

  const goSupplier = (supplierId) => {
    if (!supplierId || !isAdmin) return;
    navigate("/supplier", { state: { focusSupplierId: supplierId } });
  };

  const handleVoidTransaction = async (transactionId) => {
    if (!isAdmin) return;
    if (
      !window.confirm(
        "Void this transaction?\n\nStatus will be set to CANCELLED and stock will be reversed. This cannot be undone from the UI."
      )
    ) {
      return;
    }
    try {
      await ApiService.updateTransactionStatus(transactionId, "CANCELLED");
      showMessage("Transaction voided.");
      setFullList((prev) =>
        prev.map((t) =>
          t.id === transactionId ? { ...t, status: "CANCELLED" } : t
        )
      );
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error voiding transaction: " + error
      );
    }
  };

  const formatMoney = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return "—";
    return `$${n.toFixed(2)}`;
  };

  const linkFilterLabel =
    linkFilter?.kind === "product"
      ? `Showing movements for product #${linkFilter.id}`
      : linkFilter?.kind === "supplier"
      ? `Showing movements for supplier #${linkFilter.id}`
      : null;

  return (
    <Layout>
      {message && <p className="message">{message}</p>}
      <div className="transactions-page transactions-modern">
        <div className="transactions-modern-header">
          <div>
            <h1>Transactions</h1>
            <p className="transactions-modern-sub">
              Each row links to the product and supplier involved. Search loads up to 5,000 recent rows; use the
              report for date ranges.
            </p>
          </div>
          <div className="transactions-modern-actions">
            <Link to="/transaction-report" className="btn btn-secondary btn-md">
              Transaction report
            </Link>
          </div>
        </div>

        {linkFilter && (
          <div className="entity-link-banner">
            <span>{linkFilterLabel}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setLinkFilter(null);
                setCurrentPage(1);
              }}
            >
              Show all
            </button>
          </div>
        )}

        <div className="transactions-toolbar">
          <div className="transactions-toolbar-row">
            <div className="transactions-field">
              <label htmlFor="tx-search">Search</label>
              <input
                id="tx-search"
                placeholder="Server filter (SKU, product, supplier, type…)"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                type="text"
              />
            </div>
            <div className="transactions-toolbar-buttons">
              <button type="button" className="btn btn-primary btn-md" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="transactions-table-wrap">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Product</th>
                  <th>Supplier</th>
                  <th>Total</th>
                  <th>Qty</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.transactionType}</td>
                    <td>{transaction.status}</td>
                    <td>
                      {transaction.product?.id ? (
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => goProduct(transaction.product.id)}
                          title="Open in catalog"
                        >
                          {transaction.product.name}
                        </button>
                      ) : (
                        <span className="muted-text">—</span>
                      )}
                    </td>
                    <td>
                      {transaction.supplier?.id && isAdmin ? (
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => goSupplier(transaction.supplier.id)}
                          title="Open supplier"
                        >
                          {transaction.supplier.name}
                        </button>
                      ) : (
                        <span>{transaction.supplier?.name ?? "—"}</span>
                      )}
                    </td>
                    <td>{formatMoney(transaction.totalPrice)}</td>
                    <td>{transaction.totalProducts}</td>
                    <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ marginRight: 8 }}
                        onClick={() => navigateToTransactionDetailsPage(transaction.id)}
                      >
                        Details
                      </button>
                      {isAdmin && String(transaction.status) !== "CANCELLED" && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleVoidTransaction(transaction.id)}
                        >
                          Void
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted-text">
            {fullList.length === 0
              ? "No transactions loaded yet. Run a search or check your connection."
              : "No rows match the current filter."}
          </p>
        )}

        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </Layout>
  );
};

export default TransactionsPage;
