import React, { useState, useMemo } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "PURCHASE", label: "Stock-in (purchase)" },
  { value: "SALE", label: "Stock-out (sale)" },
  { value: "RETURN_TO_SUPPLIER", label: "Return to supplier" },
];

const formatMoney = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
};

const TransactionReportPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("");
  const [productName, setProductName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= start && d <= end;
      });
    }

    if (type) {
      list = list.filter((t) => String(t.transactionType) === type);
    }
    if (productName.trim()) {
      const q = productName.toLowerCase();
      list = list.filter((t) => (t.product?.name || "").toLowerCase().includes(q));
    }
    if (supplierName.trim()) {
      const q = supplierName.toLowerCase();
      list = list.filter((t) => (t.supplier?.name || "").toLowerCase().includes(q));
    }

    return list;
  }, [transactions, startDate, endDate, type, productName, supplierName]);

  const summary = useMemo(() => {
    let stockIn = 0;
    let stockOut = 0;
    let returned = 0;
    let totalValue = 0;
    filteredTransactions.forEach((t) => {
      const qty = Number(t.totalProducts || 0);
      const typ = String(t.transactionType);
      if (typ === "PURCHASE") stockIn += qty;
      if (typ === "SALE") stockOut += qty;
      if (typ === "RETURN_TO_SUPPLIER") returned += qty;
      totalValue += Number(t.totalPrice || 0);
    });
    return { stockIn, stockOut, returned, totalValue };
  }, [filteredTransactions]);

  const showBanner = (text, isError = false) => {
    setBanner({ text, isError });
    setTimeout(() => setBanner(null), 5000);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      showBanner("Please select both start and end dates.", true);
      return;
    }
    setLoading(true);
    try {
      const response = await ApiService.getTransactionReport(startDate, endDate);
      if (response.status === 200) {
        setTransactions(response.transactions || []);
        showBanner("Report data loaded. Adjust filters as needed.", false);
      } else {
        showBanner(response.message || "Could not load report", true);
      }
    } catch (error) {
      showBanner(error.response?.data?.message || "Error generating report", true);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      showBanner("No data to export", true);
      return;
    }
    const headers = [
      "ID",
      "Type",
      "Status",
      "Product",
      "Supplier",
      "Quantity",
      "TotalPrice",
      "Date",
    ];
    const escape = (v) => {
      const s = v == null ? "" : String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [headers.join(",")];
    filteredTransactions.forEach((t) => {
      lines.push(
        [
          t.id,
          t.transactionType,
          t.status,
          t.product?.name || "N/A",
          t.supplier?.name || "N/A",
          t.totalProducts,
          t.totalPrice,
          new Date(t.createdAt).toISOString(),
        ]
          .map(escape)
          .join(",")
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaction_report_${startDate}_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showBanner("CSV downloaded.", false);
  };

  const exportToPDF = () => {
    if (filteredTransactions.length === 0) {
      showBanner("No data to export", true);
      return;
    }
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("Inventory transaction report", 40, 44);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Range: ${startDate} → ${endDate}`, 40, 62);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 76);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Stock-in (purchase) units: ${summary.stockIn}`, 40, 98);
    doc.text(`Stock-out (sale) units: ${summary.stockOut}`, 40, 114);
    doc.text(`Returned units: ${summary.returned}`, 40, 130);
    doc.text(`Total value: ${formatMoney(summary.totalValue)}`, 40, 146);

    const tableColumn = ["ID", "Type", "Status", "Product", "Qty", "Price", "Date"];
    const tableRows = filteredTransactions.map((t) => [
      String(t.id),
      String(t.transactionType),
      String(t.status ?? ""),
      t.product?.name || "N/A",
      String(t.totalProducts ?? ""),
      formatMoney(t.totalPrice),
      new Date(t.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 164,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 128, 128] },
    });

    doc.save("transaction_report.pdf");
    showBanner("PDF downloaded.", false);
  };

  return (
    <Layout>
      <div className="transaction-report-page">
        <h1 className="transaction-report-title">Transaction report</h1>

        {banner && (
          <div className={`transaction-report-banner ${banner.isError ? "is-error" : "is-success"}`}>
            {banner.text}
          </div>
        )}

        <div className="section-card transaction-report-filters">
          <form onSubmit={handleGenerate}>
            <div className="transaction-report-grid">
              <div className="form-group">
                <label htmlFor="rep-start">Start date</label>
                <input
                  id="rep-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="premium-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="rep-end">End date</label>
                <input
                  id="rep-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="premium-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="rep-type">Transaction type</label>
                <select
                  id="rep-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="premium-input"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value || "all"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="rep-product">Product name</label>
                <input
                  id="rep-product"
                  type="text"
                  placeholder="Contains…"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="premium-input"
                />
              </div>
              <div className="form-group transaction-report-grid-span">
                <label htmlFor="rep-supplier">Supplier name</label>
                <input
                  id="rep-supplier"
                  type="text"
                  placeholder="Contains…"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="premium-input"
                />
              </div>
            </div>
            <div className="transaction-report-actions">
              <button type="submit" className="btn btn-primary btn-md" disabled={loading}>
                {loading ? "Loading…" : "Load data"}
              </button>
            </div>
          </form>
        </div>

        {filteredTransactions.length > 0 && (
          <div className="transaction-report-summary-row">
            <div className="section-card transaction-report-kpi">
              <h3>Stock-in (purchase)</h3>
              <p>{summary.stockIn}</p>
            </div>
            <div className="section-card transaction-report-kpi">
              <h3>Stock-out (sale)</h3>
              <p>{summary.stockOut}</p>
            </div>
            <div className="section-card transaction-report-kpi">
              <h3>Returned</h3>
              <p>{summary.returned}</p>
            </div>
            <div className="section-card transaction-report-kpi">
              <h3>Total value</h3>
              <p>{formatMoney(summary.totalValue)}</p>
            </div>
          </div>
        )}

        {filteredTransactions.length > 0 ? (
          <div className="section-card">
            <div className="transaction-report-preview-head">
              <h2>Preview ({filteredTransactions.length} records)</h2>
              <div className="transaction-report-export-btns">
                <button type="button" className="btn btn-secondary btn-md" onClick={exportToCSV}>
                  Export CSV
                </button>
                <button type="button" className="btn btn-primary btn-md" onClick={exportToPDF}>
                  Export PDF
                </button>
              </div>
            </div>
            <div className="transactions-table-wrap">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.slice(0, 50).map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.transactionType}</td>
                      <td>{t.status}</td>
                      <td>{t.product?.name || "—"}</td>
                      <td>{t.totalProducts}</td>
                      <td>{formatMoney(t.totalPrice)}</td>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTransactions.length > 50 && (
              <p className="muted-text transaction-report-footnote">
                Showing first 50 rows. Export CSV or PDF for the full filtered set.
              </p>
            )}
          </div>
        ) : (
          !loading &&
          transactions.length > 0 && (
            <p className="muted-text transaction-report-empty">No rows match the current filters.</p>
          )
        )}
      </div>
    </Layout>
  );
};

export default TransactionReportPage;
