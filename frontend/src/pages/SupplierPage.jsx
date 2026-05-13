import React, { useState, useEffect, useMemo } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { normalizeSupplierRow, supplierTextCell } from "../utils/normalizeSupplier";

const CHART_COLORS = [
  "#008080",
  "#2d3748",
  "#38b2ac",
  "#4a5568",
  "#81e6d9",
  "#718096",
  "#b2f5ea",
  "#a0aec0",
];

const truncateLabel = (value, max = 26) => {
  if (value == null || String(value).trim() === "") return "Unknown";
  const s = String(value).trim();
  return s.length <= max ? s : `${s.slice(0, max)}…`;
};

const SupplierPage = () => {
  const isAdmin = ApiService.isAdmin();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [focusSupplierId, setFocusSupplierId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const id = location.state?.focusSupplierId;
    if (id == null) return;
    setFocusSupplierId(Number(id));
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const getSuppliers = async () => {
      try {
        const responseData = await ApiService.getAllSuppliers();
        if (responseData.status === 200) {
          setSuppliers((responseData.suppliers || []).map(normalizeSupplierRow));
        } else {
          showMessage(responseData.message);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error getting suppliers: " + error
        );
      }
    };
    getSuppliers();
  }, [location.pathname, location.key]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await ApiService.getAllProducts();
        if (res.status === 200) setProducts(res.products || []);
      } catch (_) {}
    };
    loadProducts();
  }, []);

  const supplierRows = useMemo(() => {
    if (focusSupplierId == null) return suppliers;
    return suppliers.filter((s) => Number(s.id) === focusSupplierId);
  }, [suppliers, focusSupplierId]);

  const productCountBySupplier = useMemo(() => {
    const m = {};
    products.forEach((p) => {
      const id = Number(p.supplierId);
      if (!id) return;
      m[id] = (m[id] || 0) + 1;
    });
    return m;
  }, [products]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const locationData = useMemo(() => {
    const counts = {};
    supplierRows.forEach((supplier) => {
      const raw = supplier.address ? String(supplier.address).trim() : "";
      const key = raw ? truncateLabel(raw, 40) : "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.keys(counts).map((location) => ({
      location,
      count: counts[location],
    }));
  }, [supplierRows]);

  const goodsData = useMemo(() => {
    const counts = {};
    supplierRows.forEach((supplier) => {
      const goods = supplier.goodsSupplied ? String(supplier.goodsSupplied).trim() : "";
      const key = goods ? truncateLabel(goods, 32) : "Not specified";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.keys(counts).map((name) => ({
      name,
      value: counts[name],
    }));
  }, [supplierRows]);

  const quantityData = useMemo(() => {
    return supplierRows
      .map((s) => ({
        name: truncateLabel(s.name, 18),
        quantity: Number(s.quantity || 0),
      }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [supplierRows]);

  const totalQuantity = useMemo(
    () => supplierRows.reduce((sum, s) => sum + Number(s.quantity || 0), 0),
    [supplierRows]
  );

  const handleDeleteSupplier = async (supplierId) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await ApiService.deleteSupplier(supplierId);
      setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
      showMessage("Supplier deleted.");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error deleting supplier: " + error
      );
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    doc.setFontSize(18);
    doc.setTextColor(0, 128, 128);
    doc.text("Supplier directory report", 40, 36);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 54);

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Total suppliers: ${suppliers.length}`, 40, 74);
    doc.text(`Total stock capacity: ${totalQuantity.toLocaleString()} units`, 40, 90);

    const tableColumn = [
      "ID",
      "Name",
      "Company",
      "Email",
      "Phone",
      "Address",
      "Goods supplied",
      "Qty",
    ];
    const tableRows = suppliers.map((supplier) => [
      String(supplier.id),
      supplier.name || "—",
      supplierTextCell(supplier.company) === "—" ? "N/A" : supplierTextCell(supplier.company),
      supplierTextCell(supplier.email) === "—" ? "N/A" : supplierTextCell(supplier.email),
      supplierTextCell(supplier.phone) === "—" ? "N/A" : supplierTextCell(supplier.phone),
      supplier.address || "N/A",
      supplierTextCell(supplier.goodsSupplied) === "—" ? "N/A" : supplierTextCell(supplier.goodsSupplied),
      String(supplier.quantity ?? 0),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows.length ? tableRows : [["—", "No rows", "", "", "", "", "", ""]],
      startY: 104,
      theme: "grid",
      headStyles: { fillColor: [0, 128, 128] },
      styles: { fontSize: 8, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 36 },
        5: { cellWidth: 120 },
      },
    });

    doc.save("Supplier_Report.pdf");
    showMessage("PDF downloaded.");
  };

  return (
    <Layout>
      {message && <div className="message">{message}</div>}
      <div className="supplier-page supplier-mgmt-page">
        {focusSupplierId != null && (
          <div className="entity-link-banner supplier-focus-banner">
            <span>Filtered to one supplier (opened from product or transaction).</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setFocusSupplierId(null)}
            >
              Show all suppliers
            </button>
          </div>
        )}
        <div className="supplier-mgmt-header">
          <h1 className="supplier-mgmt-title">Supplier management</h1>
          <div className="supplier-mgmt-actions">
            {isAdmin && (
              <>
                <button type="button" className="btn btn-secondary btn-md" onClick={generatePDFReport}>
                  Download PDF report
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-md"
                  onClick={() => navigate("/add-supplier")}
                >
                  Add supplier
                </button>
              </>
            )}
          </div>
        </div>
        {!isAdmin && (
          <p className="muted-text" style={{ margin: "0 0 16px" }}>
            You can browse suppliers and use catalog links. Adding, editing, deleting, and PDF export require an administrator.
          </p>
        )}

        <div className="supplier-summary-grid">
          <div className="supplier-summary-card supplier-summary-card--teal">
            <div className="supplier-summary-label">Total suppliers</div>
            <div className="supplier-summary-value">{supplierRows.length}</div>
          </div>
          <div className="supplier-summary-card supplier-summary-card--slate">
            <div className="supplier-summary-label">Unique locations</div>
            <div className="supplier-summary-value">{locationData.length}</div>
          </div>
          <div className="supplier-summary-card supplier-summary-card--cyan">
            <div className="supplier-summary-label">Goods categories</div>
            <div className="supplier-summary-value">{goodsData.length}</div>
          </div>
          <div className="supplier-summary-card supplier-summary-card--accent">
            <div className="supplier-summary-label">Total stock capacity</div>
            <div className="supplier-summary-value">{totalQuantity.toLocaleString()}</div>
          </div>
        </div>

        {supplierRows.length > 0 && (
          <>
            <div className="supplier-charts-row">
              <div className="supplier-chart-card">
                <h3 className="supplier-chart-title">Suppliers by location</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={locationData} margin={{ top: 8, right: 12, left: 0, bottom: 48 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" tick={{ fontSize: 10 }} interval={0} angle={-22} textAnchor="end" height={70} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#008080" name="Suppliers" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="supplier-chart-card">
                <h3 className="supplier-chart-title">Suppliers by goods supplied</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={goodsData}
                      cx="50%"
                      cy="50%"
                      labelLine
                      label={({ name, percent }) =>
                        `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                      }
                      outerRadius={88}
                      dataKey="value"
                    >
                      {goodsData.map((entry, index) => (
                        <Cell key={`goods-${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="supplier-chart-card supplier-chart-card--wide">
              <h3 className="supplier-chart-title">Stock capacity by supplier</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={quantityData} margin={{ top: 8, right: 12, left: 0, bottom: 56 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-18} textAnchor="end" height={72} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#38b2ac" name="Quantity" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        <div className="supplier-table-wrap">
          <table className="supplier-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Goods</th>
                <th className="supplier-data-table-num">Qty</th>
                <th className="supplier-data-table-actions">Catalog &amp; flows</th>
                {isAdmin && <th className="supplier-data-table-actions">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="supplier-data-table-empty">
                    {isAdmin
                      ? 'No suppliers found. Use "Add supplier" to create one.'
                      : "No suppliers found."}
                  </td>
                </tr>
              ) : (
                supplierRows.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="supplier-data-table-strong">{supplier.name}</td>
                    <td>{supplierTextCell(supplier.company)}</td>
                    <td className="supplier-data-table-muted">{supplierTextCell(supplier.email)}</td>
                    <td className="supplier-data-table-muted">{supplierTextCell(supplier.phone)}</td>
                    <td>{supplier.address || "—"}</td>
                    <td>{supplierTextCell(supplier.goodsSupplied)}</td>
                    <td className="supplier-data-table-num supplier-data-table-strong">
                      {supplier.quantity ?? 0}
                    </td>
                    <td className="supplier-data-table-actions supplier-flow-links">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          navigate("/product", { state: { focusSupplierId: supplier.id } })
                        }
                      >
                        Products ({productCountBySupplier[Number(supplier.id)] ?? 0})
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          navigate("/stock-in", { state: { supplierId: supplier.id } })
                        }
                      >
                        Stock-in
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          navigate("/transaction", { state: { focusSupplierId: supplier.id } })
                        }
                      >
                        Movements
                      </button>
                    </td>
                    {isAdmin && (
                      <td className="supplier-data-table-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/edit-supplier/${supplier.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default SupplierPage;
