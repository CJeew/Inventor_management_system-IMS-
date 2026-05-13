import React, { useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { normalizeSupplierRow } from "../utils/normalizeSupplier";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../logo.png";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const CHART_COLORS = [
  "#008080",
  "#4C78A8",
  "#F58518",
  "#E45756",
  "#72B7B2",
  "#54A24B",
  "#EECA3B",
  "#B279A2",
];

const IconTransactions = () => (
  <svg className="dashboard-module-card-svg" viewBox="0 0 24 24" width="26" height="26" aria-hidden>
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 19V5M8 19V10M12 19v-6M16 19V8M20 19V12"
    />
  </svg>
);

const IconProducts = () => (
  <svg className="dashboard-module-card-svg" viewBox="0 0 24 24" width="26" height="26" aria-hidden>
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"
    />
  </svg>
);

const IconSuppliers = () => (
  <svg className="dashboard-module-card-svg" viewBox="0 0 24 24" width="26" height="26" aria-hidden>
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M1 3h15v11H1zM16 8h4l3 3v3h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
    />
  </svg>
);

const IconWarehouse = () => (
  <svg className="dashboard-module-card-svg" viewBox="0 0 24 24" width="26" height="26" aria-hidden>
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9l9-7 9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9zM9 22V12h6v10"
    />
  </svg>
);

const IconCategory = () => (
  <svg className="dashboard-module-card-svg" viewBox="0 0 24 24" width="26" height="26" aria-hidden>
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01"
    />
  </svg>
);

const DashboardPage = () => {
  const isAdmin = ApiService.isAdmin();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [activeDashboard, setActiveDashboard] = useState("home");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [managerSearch, setManagerSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionResponse, productsResponse, categoriesResponse, suppliersResponse] =
          await Promise.all([
            ApiService.getAllTransactions(),
            ApiService.getAllProducts(),
            ApiService.getAllCategory(),
            ApiService.getAllSuppliers(),
          ]);

        if (transactionResponse.status === 200) setTransactions(transactionResponse.transactions || []);
        if (productsResponse.status === 200) setProducts(productsResponse.products || []);
        if (categoriesResponse?.status === 200) setCategories(categoriesResponse.categories || []);
        if (suppliersResponse?.status === 200) setSuppliers((suppliersResponse.suppliers || []).map(normalizeSupplierRow));
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Loggin in a User: " + error
        );
      }
    };
    fetchData();
  }, []);

  //event handler for month selection or change
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  //event handler for year selection or change
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const date = new Date(transaction.createdAt);
        return (
          date.getMonth() + 1 === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      }),
    [transactions, selectedMonth, selectedYear]
  );

  const salesTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.transactionType === "SALE"),
    [filteredTransactions]
  );

  const purchaseTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.transactionType === "PURCHASE"),
    [filteredTransactions]
  );

  const totalSalesUnits = salesTransactions.reduce(
    (sum, t) => sum + Number(t.totalProducts || 0),
    0
  );
  const totalRevenue = salesTransactions.reduce(
    (sum, t) => sum + Number(t.totalPrice || 0),
    0
  );

  const lowStockProducts = useMemo(
    () =>
      products
        .filter((product) => Number(product.stockQuantity || 0) <= 5)
        .sort((a, b) => Number(a.stockQuantity || 0) - Number(b.stockQuantity || 0)),
    [products]
  );

  const stockOverviewData = useMemo(() => {
    const inStock = products.filter((p) => Number(p.stockQuantity || 0) > 5).length;
    const lowStock = products.filter(
      (p) => Number(p.stockQuantity || 0) > 0 && Number(p.stockQuantity || 0) <= 5
    ).length;
    const outOfStock = products.filter((p) => Number(p.stockQuantity || 0) <= 0).length;
    return [
      { name: "In Stock", value: inStock },
      { name: "Low Stock", value: lowStock },
      { name: "Out of Stock", value: outOfStock },
    ];
  }, [products]);

  const categoryDistributionData = useMemo(() => {
    const categoryNameById = new Map(
      categories.map((category) => [Number(category.id), category.name])
    );
    const counts = new Map();
    products.forEach((product) => {
      const categoryId = Number(product.categoryId ?? product.category?.id);
      const categoryName = categoryNameById.get(categoryId) || "Uncategorized";
      counts.set(categoryName, (counts.get(categoryName) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [products, categories]);

  const supplierTotalCapacity = useMemo(
    () => suppliers.reduce((sum, s) => sum + Number(s.quantity || 0), 0),
    [suppliers]
  );

  const supplierWithEmailCount = useMemo(
    () => suppliers.filter((s) => s.email && String(s.email).trim()).length,
    [suppliers]
  );

  const supplierUniqueLocations = useMemo(() => {
    const set = new Set();
    suppliers.forEach((s) => {
      const a = s.address ? String(s.address).trim() : "";
      set.add(a || "Unknown");
    });
    return set.size;
  }, [suppliers]);

  const supplierLocationChartData = useMemo(() => {
    const counts = {};
    suppliers.forEach((s) => {
      const raw = s.address ? String(s.address).trim() : "";
      const key = raw.length > 24 ? `${raw.slice(0, 22)}…` : raw || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [suppliers]);

  const supplierTopCapacityData = useMemo(() => {
    return [...suppliers]
      .map((s) => ({
        name:
          (s.name || "—").length > 14 ? `${String(s.name).slice(0, 12)}…` : s.name || "—",
        qty: Number(s.quantity || 0),
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
  }, [suppliers]);

  const salesTrendData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const daily = Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      sales: 0,
    }));
    salesTransactions.forEach((transaction) => {
      const day = new Date(transaction.createdAt).getDate();
      daily[day - 1].sales += Number(transaction.totalPrice || 0);
    });
    return daily;
  }, [salesTransactions, selectedMonth, selectedYear]);

  const topProductsData = useMemo(() => {
    const productSales = new Map();
    salesTransactions.forEach((transaction) => {
      const name =
        transaction.product?.name || `Product ${transaction.product?.id || "Unknown"}`;
      productSales.set(
        name,
        (productSales.get(name) || 0) + Number(transaction.totalProducts || 0)
      );
    });
    return Array.from(productSales.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);
  }, [salesTransactions]);

  const profitAnalysisData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const daily = Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      revenue: 0,
      cost: 0,
      profit: 0,
    }));
    salesTransactions.forEach((transaction) => {
      const day = new Date(transaction.createdAt).getDate();
      daily[day - 1].revenue += Number(transaction.totalPrice || 0);
    });
    purchaseTransactions.forEach((transaction) => {
      const day = new Date(transaction.createdAt).getDate();
      daily[day - 1].cost += Number(transaction.totalPrice || 0);
    });
    daily.forEach((row) => {
      row.profit = row.revenue - row.cost;
    });
    return daily;
  }, [salesTransactions, purchaseTransactions, selectedMonth, selectedYear]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const handleDownloadAdminDashboardPdf = () => {
    if (!isAdmin || activeDashboard !== "product") return;

    const doc = new jsPDF();
    const monthLabel = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString(
      "default",
      { month: "long", year: "numeric" }
    );

    doc.setFontSize(17);
    doc.text("Product Management Dashboard Report", 14, 16);
    doc.setFontSize(10);
    doc.text(`Period: ${monthLabel}`, 14, 22);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);

    doc.setFontSize(12);
    doc.text("KPI Summary", 14, 36);

    autoTable(doc, {
      startY: 39,
      head: [["Metric", "Value"]],
      body: [
        ["Total Products", String(products.length)],
        ["Sales (Units)", String(totalSalesUnits)],
        ["Revenue", formatCurrency(totalRevenue)],
        ["Low Stock Products", String(lowStockProducts.length)],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 128, 128] },
    });

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 50) + 8,
      head: [["Top Products", "Units Sold"]],
      body:
        topProductsData.length > 0
          ? topProductsData.map((item) => [item.name, String(item.quantity)])
          : [["No sales data", "-"]],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [76, 120, 168] },
    });

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 80) + 8,
      head: [["Low Stock Alerts", "Quantity Left"]],
      body:
        lowStockProducts.length > 0
          ? lowStockProducts.slice(0, 25).map((item) => [
              item.name,
              String(item.stockQuantity ?? 0),
            ])
          : [["No low stock products", "-"]],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [245, 133, 24] },
    });

    doc.save(`product-dashboard-${selectedYear}-${selectedMonth}.pdf`);
  };

  const profitChartData = useMemo(() => {
    if (isAdmin) return profitAnalysisData;
    const nonZeroRows = profitAnalysisData.filter(
      (row) => row.revenue !== 0 || row.cost !== 0 || row.profit !== 0
    );
    if (nonZeroRows.length > 0) return nonZeroRows;
    return profitAnalysisData.slice(0, Math.min(7, profitAnalysisData.length));
  }, [isAdmin, profitAnalysisData]);

  const recentActivities = useMemo(
    () =>
      [...filteredTransactions]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6),
    [filteredTransactions]
  );

  const filteredInventoryProducts = useMemo(() => {
    const q = managerSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.sku, p.supplierName, p.category?.name]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }, [products, managerSearch]);

  const returnTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.transactionType === "RETURN_TO_SUPPLIER"),
    [filteredTransactions]
  );

  const totalPurchaseSpend = purchaseTransactions.reduce(
    (sum, t) => sum + Number(t.totalPrice || 0),
    0
  );
  const totalPurchaseUnits = purchaseTransactions.reduce(
    (sum, t) => sum + Number(t.totalProducts || 0),
    0
  );

  const txTypeValuePieData = useMemo(() => {
    const totals = { PURCHASE: 0, SALE: 0, RETURN_TO_SUPPLIER: 0 };
    filteredTransactions.forEach((t) => {
      const k = t.transactionType;
      if (Object.prototype.hasOwnProperty.call(totals, k)) {
        totals[k] += Number(t.totalPrice || 0);
      }
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }, [filteredTransactions]);

  const txTypeCountPieData = useMemo(() => {
    const totals = { PURCHASE: 0, SALE: 0, RETURN_TO_SUPPLIER: 0 };
    filteredTransactions.forEach((t) => {
      const k = t.transactionType;
      if (Object.prototype.hasOwnProperty.call(totals, k)) totals[k] += 1;
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }, [filteredTransactions]);

  const txStackedByDayData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const daily = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      PURCHASE: 0,
      SALE: 0,
      RETURN_TO_SUPPLIER: 0,
    }));
    filteredTransactions.forEach((t) => {
      const day = new Date(t.createdAt).getDate();
      const k = t.transactionType;
      if (daily[day - 1][k] !== undefined) {
        daily[day - 1][k] += Number(t.totalPrice || 0);
      }
    });
    return daily;
  }, [filteredTransactions, selectedMonth, selectedYear]);

  const topProductsRevenueData = useMemo(() => {
    const m = new Map();
    salesTransactions.forEach((t) => {
      const name = t.product?.name || `Product ${t.product?.id || "?"}`;
      m.set(name, (m.get(name) || 0) + Number(t.totalPrice || 0));
    });
    return Array.from(m.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [salesTransactions]);

  const topSuppliersPurchaseData = useMemo(() => {
    const m = new Map();
    purchaseTransactions.forEach((t) => {
      const name = t.supplier?.name || "Unknown supplier";
      m.set(name, (m.get(name) || 0) + Number(t.totalPrice || 0));
    });
    return Array.from(m.entries())
      .map(([name, spend]) => ({ name, spend }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 8);
  }, [purchaseTransactions]);

  const txStatusPieData = useMemo(() => {
    const m = new Map();
    filteredTransactions.forEach((t) => {
      const s = String(t.status ?? "UNKNOWN");
      m.set(s, (m.get(s) || 0) + 1);
    });
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const managerDailyUnitsData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const daily = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      units: 0,
    }));
    salesTransactions.forEach((t) => {
      const day = new Date(t.createdAt).getDate();
      daily[day - 1].units += Number(t.totalProducts || 0);
    });
    return daily;
  }, [salesTransactions, selectedMonth, selectedYear]);

  const returnsProcessingCount = useMemo(
    () =>
      filteredTransactions.filter(
        (t) =>
          t.transactionType === "RETURN_TO_SUPPLIER" && String(t.status) === "PROCESSING"
      ).length,
    [filteredTransactions]
  );

  const managerRecentTx = useMemo(
    () =>
      [...filteredTransactions]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8),
    [filteredTransactions]
  );

  const handleExportTransactionCsv = () => {
    const headers = [
      "ID",
      "Type",
      "Status",
      "Product",
      "SKU",
      "Qty",
      "TotalPrice",
      "Supplier",
      "CreatedAt",
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
          t.product?.name ?? "",
          t.product?.sku ?? "",
          t.totalProducts ?? "",
          t.totalPrice ?? "",
          t.supplier?.name ?? "",
          t.createdAt ? new Date(t.createdAt).toISOString() : "",
        ]
          .map(escape)
          .join(",")
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${selectedYear}-${String(selectedMonth).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage("CSV exported for selected month.");
  };

  const handleDownloadTransactionMonthPdf = () => {
    if (!isAdmin) return;
    const monthLabel = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString(
      "default",
      { month: "long", year: "numeric" }
    );
    const doc = new jsPDF();
    doc.setFontSize(17);
    doc.text("Transaction Management Report", 14, 16);
    doc.setFontSize(10);
    doc.text(`Period: ${monthLabel}`, 14, 22);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);
    doc.setFontSize(12);
    doc.text("Summary", 14, 38);
    autoTable(doc, {
      startY: 41,
      head: [["Metric", "Value"]],
      body: [
        ["Transactions", String(filteredTransactions.length)],
        ["Sales units", String(totalSalesUnits)],
        ["Revenue", formatCurrency(totalRevenue)],
        ["Purchase spend", formatCurrency(totalPurchaseSpend)],
        ["Returns (count)", String(returnTransactions.length)],
        ["Returns in progress", String(returnsProcessingCount)],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 128, 128] },
    });
    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 80) + 8,
      head: [["ID", "Type", "Status", "Product", "Qty", "Total", "Date"]],
      body:
        filteredTransactions.length > 0
          ? filteredTransactions.slice(0, 60).map((t) => [
              String(t.id),
              String(t.transactionType),
              String(t.status ?? ""),
              String(t.product?.name ?? ""),
              String(t.totalProducts ?? ""),
              formatCurrency(t.totalPrice),
              new Date(t.createdAt).toLocaleString(),
            ])
          : [["—", "No rows", "", "", "", "", ""]],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [76, 120, 168] },
    });
    doc.save(`transaction-dashboard-${selectedYear}-${selectedMonth}.pdf`);
    showMessage("PDF report downloaded.");
  };

  const dashboardTitle =
    activeDashboard === "transaction"
      ? "Transaction Management Dashboard"
      : activeDashboard === "supplier"
      ? "Supplier Management Dashboard"
      : activeDashboard === "warehouse"
      ? "Location & Warehouse Management"
      : activeDashboard === "category"
      ? "Category Management Dashboard"
      : "Product Management Dashboard";

  const dashboardSubtitle =
    activeDashboard === "home"
      ? "Here's what's happening with your StockSmart workspace today."
      : activeDashboard === "transaction"
      ? "Transaction analytics for the selected month — exports and shortcuts below."
      : activeDashboard === "category"
      ? "Browse product categories — open the full page to view or (as admin) manage categories."
      : activeDashboard === "supplier"
      ? isAdmin
        ? "Vendor KPIs and charts — manage records on the full supplier page."
        : "Vendor overview for daily ops. Directory is view-only; only admins can add or edit suppliers."
      : activeDashboard === "warehouse"
      ? "Shortcuts and tools for this area — more content may be added here later."
      : "Inventory insights, stock health, and performance";

  return (
    <Layout>
      {message && <div className="message">{message}</div>}
      <div className="dashboard-page">
        <div className="dashboard-page-deco" aria-hidden="true">
          <span className="dashboard-page-deco-logo" style={{ backgroundImage: `url(${logo})` }} />
          <span className="dashboard-page-deco-veil" />
        </div>
        <div
          className={`dashboard-title-wrap${activeDashboard === "home" ? " dashboard-title-wrap--welcome" : ""}`}
        >
          <div className="dashboard-brand">
            <img className="dashboard-logo" src={logo} alt="StockSmart logo" />
            <div className="dashboard-brand-text">
              <h1 className={`dashboard-title${activeDashboard === "home" ? " dashboard-title--welcome" : ""}`}>
                {activeDashboard === "home" ? (
                  <>
                    Welcome back, {isAdmin ? "Admin" : "Manager"}{" "}
                    <span className="dashboard-welcome-emoji" aria-hidden>
                      👋
                    </span>
                  </>
                ) : (
                  dashboardTitle
                )}
              </h1>
              <p className="dashboard-subtitle">{dashboardSubtitle}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-hero-panel">
          <div className="dashboard-module-grid" role="navigation" aria-label="Dashboard workspaces">
            <button
              type="button"
              className={`dashboard-module-card dashboard-module-card--transaction${
                activeDashboard === "transaction" ? " is-active" : ""
              }`}
              onClick={() => setActiveDashboard("transaction")}
              aria-label="Open transactions workspace"
            >
              <span className="dashboard-module-card-icon">
                <IconTransactions />
              </span>
              <span className="dashboard-module-card-title">Transactions</span>
              <span className="dashboard-module-card-desc">
                Track sales, purchases, returns, and monthly performance.
              </span>
              <span className="dashboard-module-card-cta" aria-hidden>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            <button
              type="button"
              className={`dashboard-module-card dashboard-module-card--product${
                activeDashboard === "product" ? " is-active" : ""
              }`}
              onClick={() => setActiveDashboard("product")}
              aria-label="Open products workspace"
            >
              <span className="dashboard-module-card-icon">
                <IconProducts />
              </span>
              <span className="dashboard-module-card-title">Products</span>
              <span className="dashboard-module-card-desc">
                Monitor stock levels, categories, and catalog health.
              </span>
              <span className="dashboard-module-card-cta" aria-hidden>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            <button
              type="button"
              className={`dashboard-module-card dashboard-module-card--supplier${
                activeDashboard === "supplier" ? " is-active" : ""
              }`}
              onClick={() => setActiveDashboard("supplier")}
              aria-label="Open suppliers workspace"
            >
              <span className="dashboard-module-card-icon">
                <IconSuppliers />
              </span>
              <span className="dashboard-module-card-title">Suppliers</span>
              <span className="dashboard-module-card-desc">
                Review vendor relationships and procurement touchpoints.
              </span>
              <span className="dashboard-module-card-cta" aria-hidden>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            <button
              type="button"
              className={`dashboard-module-card dashboard-module-card--warehouse${
                activeDashboard === "warehouse" ? " is-active" : ""
              }`}
              onClick={() => setActiveDashboard("warehouse")}
              aria-label="Open locations and warehouses workspace"
            >
              <span className="dashboard-module-card-icon">
                <IconWarehouse />
              </span>
              <span className="dashboard-module-card-title">Locations & Warehouses</span>
              <span className="dashboard-module-card-desc">
                Organize storage sites and stock placement across the network.
              </span>
              <span className="dashboard-module-card-cta" aria-hidden>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            <button
              type="button"
              className={`dashboard-module-card dashboard-module-card--category${
                activeDashboard === "category" ? " is-active" : ""
              }`}
              onClick={() => setActiveDashboard("category")}
              aria-label="Open category management workspace"
            >
              <span className="dashboard-module-card-icon">
                <IconCategory />
              </span>
              <span className="dashboard-module-card-title">Category management</span>
              <span className="dashboard-module-card-desc">
                Structure catalog groupings and keep product families consistent.
              </span>
              <span className="dashboard-module-card-cta" aria-hidden>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {activeDashboard !== "home" && (
          <div className="dashboard-overview-action">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveDashboard("home")}>
              ← Dashboard overview
            </button>
          </div>
        )}

        {activeDashboard === "home" ? (
          <div className="dashboard-content dashboard-home-hub">
            <p className="dashboard-home-lead">
              You are on the overview. Tap a card above to load that workspace — charts, exports, and shortcuts
              appear below when you pick a module.
            </p>
          </div>
        ) : activeDashboard === "product" ? (
          <div className="dashboard-content">
            {!isAdmin && (
              <div className="manager-wireframe-header">
                <div className="manager-header-left">
                  <span className="manager-profile-pill">Manager Profile</span>
                </div>
                <div className="manager-header-right">
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={managerSearch}
                    onChange={(e) => setManagerSearch(e.target.value)}
                  />
                  <button className="notification-btn">
                    Notifications ({lowStockProducts.length})
                  </button>
                </div>
              </div>
            )}

            <div className="dashboard-toolbar">
              <div className="filter-section">
                <label htmlFor="month-select">Month:</label>
                <select id="month-select" value={selectedMonth} onChange={handleMonthChange}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
                <label htmlFor="year-select">Year:</label>
                <select id="year-select" value={selectedYear} onChange={handleYearChange}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              {isAdmin && (
                <button
                  className="btn btn-secondary btn-md"
                  onClick={handleDownloadAdminDashboardPdf}
                >
                  Download PDF Report
                </button>
              )}
            </div>

          <div className="dashboard-cards">
            <div className="dashboard-card">
              <p className="dashboard-card-label">Total Products</p>
              <h2>{products.length}</h2>
            </div>
            <div className="dashboard-card">
              <p className="dashboard-card-label">Sales</p>
              <h2>{totalSalesUnits}</h2>
            </div>
            <div className="dashboard-card">
              <p className="dashboard-card-label">Revenue</p>
              <h2>{formatCurrency(totalRevenue)}</h2>
            </div>
            <div className="dashboard-card">
              <p className="dashboard-card-label">Low Stock</p>
              <h2>{lowStockProducts.length}</h2>
            </div>
          </div>

          <div className="dashboard-grid two-col">
            <div className="chart-container">
              <h3>Stock Overview</h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={stockOverviewData} dataKey="value" nameKey="name" outerRadius={110} label>
                    {stockOverviewData.map((entry, index) => (
                      <Cell key={`stock-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-container">
              <h3>Category Distribution</h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={categoryDistributionData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    label
                  >
                    {categoryDistributionData.map((entry, index) => (
                      <Cell
                        key={`category-cell-${entry.name}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-grid one-col">
            <div className="chart-container">
              <h3>Sales Trend</h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#008080" name="Sales Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-grid two-col">
            <div className="chart-container">
              <h3>{isAdmin ? "Top Products" : "Recent Activity"}</h3>
              {isAdmin ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" name="Units Sold" fill="#008080" />
                </BarChart>
              </ResponsiveContainer>
              ) : (
                <div className="low-stock-list">
                  {recentActivities.length === 0 ? (
                    <p className="muted-text">No recent activity in this period.</p>
                  ) : (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="low-stock-item">
                        <span>
                          {activity.transactionType} - {activity.product?.name || "Product"}
                        </span>
                        <strong>{new Date(activity.createdAt).toLocaleDateString()}</strong>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="chart-container">
              <h3>{isAdmin ? "Low Stock Alerts" : "Alerts"}</h3>
              <div className="low-stock-list">
                {lowStockProducts.length === 0 ? (
                  <p className="muted-text">No low stock products.</p>
                ) : (
                  lowStockProducts.map((product) => (
                    <div key={product.id} className="low-stock-item">
                      <span>{product.name}</span>
                      <strong>{Number(product.stockQuantity || 0)} left</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {!isAdmin && (
            <div className="dashboard-grid one-col">
              <div className="chart-container">
                <h3>Inventory Table</h3>
                <div className="inventory-table-wrap">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Supplier</th>
                        <th>Quantity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventoryProducts.slice(0, 20).map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.sku}</td>
                          <td>{product.category?.name || "N/A"}</td>
                          <td>{product.supplierName || "N/A"}</td>
                          <td>{product.stockQuantity}</td>
                          <td>{Number(product.stockQuantity) > 0 ? "In Stock" : "Out of Stock"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="dashboard-grid one-col">
            <div className="chart-container">
              <h3>Profit Analysis</h3>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart
                  data={profitChartData}
                  margin={{ top: 8, right: 18, left: 10, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <ReferenceLine yAxisId="right" y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                  <Bar yAxisId="left" dataKey="revenue" fill="#4C78A8" name="Revenue" />
                  <Bar yAxisId="left" dataKey="cost" fill="#F58518" name="Cost" />
                  <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#008080" name="Profit" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        ) : activeDashboard === "transaction" ? (
          <div className="dashboard-content dashboard-transaction-shell">
            <p className="dashboard-transaction-lead">
              {isAdmin
                ? "Financial & pipeline view for the selected month — drill down to products and suppliers."
                : "Operations view — daily sales rhythm, receipts, and quick links to common tasks."}
            </p>

            <div className="dashboard-toolbar dashboard-tx-toolbar">
              <div className="filter-section">
                <label htmlFor="tx-month-select">Month:</label>
                <select id="tx-month-select" value={selectedMonth} onChange={handleMonthChange}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
                <label htmlFor="tx-year-select">Year:</label>
                <select id="tx-year-select" value={selectedYear} onChange={handleYearChange}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="dashboard-tx-toolbar-actions">
                <button type="button" className="btn btn-secondary btn-md" onClick={handleExportTransactionCsv}>
                  Export month (CSV)
                </button>
                {isAdmin && (
                  <button type="button" className="btn btn-primary btn-md" onClick={handleDownloadTransactionMonthPdf}>
                    Export month (PDF)
                  </button>
                )}
              </div>
            </div>

            <div className="dashboard-tx-actions">
              <button type="button" className="btn btn-primary btn-md" onClick={() => navigate("/transaction")}>
                Full transaction ledger
              </button>
              <button type="button" className="btn btn-secondary btn-md" onClick={() => navigate("/stock-out")}>
                Record stock-out
              </button>
              <button type="button" className="btn btn-secondary btn-md" onClick={() => navigate("/stock-in")}>
                Receive stock
              </button>
              <button type="button" className="btn btn-ghost btn-md" onClick={() => navigate("/product")}>
                Product catalog
              </button>
              <button type="button" className="btn btn-ghost btn-md" onClick={() => setActiveDashboard("home")}>
                Dashboard overview
              </button>
            </div>

            {isAdmin ? (
              <>
                <div className="dashboard-cards dashboard-tx-kpis">
                  <div className="dashboard-card">
                    <p className="dashboard-card-label">Transactions (month)</p>
                    <h2>{filteredTransactions.length}</h2>
                  </div>
                  <div className="dashboard-card">
                    <p className="dashboard-card-label">Sales revenue</p>
                    <h2>{formatCurrency(totalRevenue)}</h2>
                  </div>
                  <div className="dashboard-card">
                    <p className="dashboard-card-label">Purchase spend</p>
                    <h2>{formatCurrency(totalPurchaseSpend)}</h2>
                  </div>
                  <div className="dashboard-card">
                    <p className="dashboard-card-label">Returns in progress</p>
                    <h2>{returnsProcessingCount}</h2>
                  </div>
                </div>

                <div className="dashboard-grid two-col">
                  <div className="chart-container">
                    <h3>Volume mix by value ($)</h3>
                    {txTypeValuePieData.length === 0 ? (
                      <p className="muted-text chart-empty">No transactions this month.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={txTypeValuePieData} dataKey="value" nameKey="name" outerRadius={100} label>
                            {txTypeValuePieData.map((entry, index) => (
                              <Cell key={`txv-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => formatCurrency(v)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="chart-container">
                    <h3>Status mix (count)</h3>
                    {txStatusPieData.length === 0 ? (
                      <p className="muted-text chart-empty">No data.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={txStatusPieData} dataKey="value" nameKey="name" outerRadius={100} label>
                            {txStatusPieData.map((entry, index) => (
                              <Cell key={`txs-${entry.name}`} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="dashboard-grid one-col">
                  <div className="chart-container">
                    <h3>Daily flow by type ($ stacked)</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={txStackedByDayData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} />
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Legend />
                        <Bar dataKey="PURCHASE" stackId="a" name="Purchase" fill="#F58518" />
                        <Bar dataKey="SALE" stackId="a" name="Sale" fill="#008080" />
                        <Bar dataKey="RETURN_TO_SUPPLIER" stackId="a" name="Return" fill="#E45756" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="dashboard-grid one-col">
                  <div className="chart-container">
                    <h3>Cash flow — revenue vs purchase cost (month)</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <ComposedChart data={profitAnalysisData} margin={{ top: 8, right: 18, left: 10, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <ReferenceLine yAxisId="right" y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                        <Bar yAxisId="left" dataKey="revenue" fill="#4C78A8" name="Sale revenue" />
                        <Bar yAxisId="left" dataKey="cost" fill="#F58518" name="Purchase cost" />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="profit"
                          stroke="#008080"
                          name="Net"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="dashboard-grid two-col">
                  <div className="chart-container">
                    <h3>Top products by sale revenue</h3>
                    {topProductsRevenueData.length === 0 ? (
                      <p className="muted-text chart-empty">No sales this month.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart layout="vertical" data={topProductsRevenueData} margin={{ left: 12, right: 12 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v) => formatCurrency(v)} />
                          <Bar dataKey="revenue" name="Revenue" fill="#4C78A8" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="chart-container">
                    <h3>Top suppliers by purchase spend</h3>
                    {topSuppliersPurchaseData.length === 0 ? (
                      <p className="muted-text chart-empty">No purchases this month.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart layout="vertical" data={topSuppliersPurchaseData} margin={{ left: 12, right: 12 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v) => formatCurrency(v)} />
                          <Bar dataKey="spend" name="Spend" fill="#F58518" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="dashboard-cards dashboard-tx-kpis">
                  <div className="dashboard-card">
                    <p className="dashboard-card-label">Sale units (month)</p>
                    <h2>{totalSalesUnits}</h2>
                  </div>
                  <div className="dashboard-card">
                    <p className="dashboard-card-label">Purchase units (month)</p>
                    <h2>{totalPurchaseUnits}</h2>
                  </div>
                  <div className="dashboard-card">
                    <p className="dashboard-card-label">Returns in progress</p>
                    <h2>{returnsProcessingCount}</h2>
                  </div>
                  <div className="dashboard-card">
                    <p className="dashboard-card-label">Low stock SKUs</p>
                    <h2>{lowStockProducts.length}</h2>
                  </div>
                </div>

                <div className="dashboard-grid two-col">
                  <div className="chart-container">
                    <h3>Daily sale units</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={managerDailyUnitsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="units" stroke="#008080" name="Units sold" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-container">
                    <h3>Transaction mix (count)</h3>
                    {txTypeCountPieData.length === 0 ? (
                      <p className="muted-text chart-empty">No transactions this month.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={txTypeCountPieData} dataKey="value" nameKey="name" outerRadius={100} label>
                            {txTypeCountPieData.map((entry, index) => (
                              <Cell key={`txc-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="dashboard-grid two-col">
                  <div className="chart-container">
                    <h3>Returns pipeline</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={[{ name: "Processing returns", count: returnsProcessingCount }]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Count" fill="#E45756" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-container">
                    <h3>Recent transactions</h3>
                    <div className="low-stock-list">
                      {managerRecentTx.length === 0 ? (
                        <p className="muted-text">No activity this month.</p>
                      ) : (
                        managerRecentTx.map((t) => (
                          <div key={t.id} className="low-stock-item">
                            <span>
                              {t.transactionType} · {t.product?.name || "Product"} · {String(t.status)}
                            </span>
                            <strong>{new Date(t.createdAt).toLocaleDateString()}</strong>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : activeDashboard === "category" ? (
          <div className="dashboard-content dashboard-transaction-shell">
            <p className="dashboard-transaction-lead">
              Product categories group your catalog. Open the full page to browse the list
              {isAdmin ? " and maintain categories." : " (add, edit, and delete require an administrator)."}
            </p>
            <div className="dashboard-tx-actions">
              <button type="button" className="btn btn-primary btn-md" onClick={() => navigate("/category")}>
                Open category management
              </button>
              <button type="button" className="btn btn-ghost btn-md" onClick={() => setActiveDashboard("home")}>
                Back to overview
              </button>
            </div>
          </div>
        ) : activeDashboard === "supplier" ? (
          <div className="dashboard-content dashboard-transaction-shell">
            <p className="dashboard-transaction-lead">
              {isAdmin
                ? "Vendor directory and capacity at a glance. Open the full page to add or edit suppliers, or jump to receipts and movements."
                : "Vendor overview for daily operations. Browse contacts and capacity on the directory; only administrators can add or change supplier records."}
            </p>
            <div className="dashboard-tx-actions">
              <button type="button" className="btn btn-primary btn-md" onClick={() => navigate("/supplier")}>
                Open supplier directory
              </button>
              <button type="button" className="btn btn-secondary btn-md" onClick={() => navigate("/stock-in")}>
                Stock-in
              </button>
              <button type="button" className="btn btn-secondary btn-md" onClick={() => navigate("/transaction")}>
                Transactions
              </button>
              {isAdmin && (
                <button type="button" className="btn btn-secondary btn-md" onClick={() => navigate("/add-supplier")}>
                  Add supplier
                </button>
              )}
              <button type="button" className="btn btn-ghost btn-md" onClick={() => setActiveDashboard("home")}>
                Back to overview
              </button>
            </div>

            <div className="dashboard-cards dashboard-tx-kpis">
              <div className="dashboard-card">
                <p className="dashboard-card-label">Suppliers</p>
                <h2>{suppliers.length}</h2>
              </div>
              <div className="dashboard-card">
                <p className="dashboard-card-label">Total capacity (qty)</p>
                <h2>{supplierTotalCapacity.toLocaleString()}</h2>
              </div>
              <div className="dashboard-card">
                <p className="dashboard-card-label">With email on file</p>
                <h2>{supplierWithEmailCount}</h2>
              </div>
              <div className="dashboard-card">
                <p className="dashboard-card-label">Location groups</p>
                <h2>{supplierUniqueLocations}</h2>
              </div>
            </div>

            <div className="dashboard-grid two-col">
              <div className="chart-container">
                <h3>Suppliers by location (truncated)</h3>
                {supplierLocationChartData.length === 0 ? (
                  <p className="muted-text chart-empty">No suppliers yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={supplierLocationChartData} margin={{ top: 8, right: 12, left: 0, bottom: 64 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={72} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Suppliers" fill="#008080" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="chart-container">
                <h3>Top suppliers by recorded capacity</h3>
                {supplierTopCapacityData.length === 0 ? (
                  <p className="muted-text chart-empty">No capacity data.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={supplierTopCapacityData} margin={{ top: 8, right: 12, left: 0, bottom: 48 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-16} textAnchor="end" height={64} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="qty" name="Quantity" fill="#38b2ac" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="chart-container dashboard-placeholder-card">
            <h3>{dashboardTitle}</h3>
            <p className="muted-text">This section is currently empty.</p>
            <button
              className="btn btn-primary btn-md"
              onClick={() => setActiveDashboard("home")}
              style={{ maxWidth: 260, marginTop: 12 }}
            >
              Back to dashboard overview
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default DashboardPage;
