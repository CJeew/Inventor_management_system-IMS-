import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ApiService from "../service/ApiService";
import { getAvailabilityStatus } from "../utils/productDisplay";

const ITEMS_PER_PAGE = 12;

export function useProductManagement() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [supplierFilterId, setSupplierFilterId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const isAdmin = ApiService.isAdmin();
  const isManagerView = !isAdmin;

  const navigate = useNavigate();
  const location = useLocation();

  const showMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  }, []);

  const applyClientFilters = useCallback(
    (list) => {
      let out = list;
      const categoryId = selectedCategoryId ? Number(selectedCategoryId) : null;
      if (categoryId) {
        out = out.filter((p) => (p.categoryId ?? p.category?.id) === categoryId);
      }
      if (supplierFilterId != null) {
        out = out.filter((p) => Number(p.supplierId) === supplierFilterId);
      }
      return out;
    },
    [selectedCategoryId, supplierFilterId]
  );

  const loadFilteredList = useCallback(async () => {
    let productData;
    if (isSearching && searchValue.trim() !== "") {
      productData = await ApiService.searchProduct(searchValue.trim());
    } else {
      productData = await ApiService.getAllProducts();
    }
    if (productData.status !== 200) {
      return {
        ok: false,
        message: productData.message || "Error loading products",
        list: [],
      };
    }
    const list = applyClientFilters(productData.products || []);
    return { ok: true, list };
  }, [isSearching, searchValue, applyClientFilters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await ApiService.getAllCategory();
        if (res.status === 200 && res.categories) setCategories(res.categories);
      } catch (_) {}
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await ApiService.getLoggedInUsesInfo();
        setUserProfile(userInfo);
      } catch (_) {}
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const focusId = location.state?.focusProductId;
    if (!focusId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await ApiService.getProductById(String(focusId));
        if (!cancelled && res.status === 200 && res.product) {
          setSelectedProduct(res.product);
        }
      } catch (_) {
        /* ignore */
      } finally {
        if (!cancelled) {
          navigate(location.pathname, { replace: true, state: {} });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.state?.focusProductId, location.pathname, navigate]);

  useEffect(() => {
    const sid = location.state?.focusSupplierId;
    if (sid == null) return;
    setSupplierFilterId(Number(sid));
    setCurrentPage(1);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state?.focusSupplierId, location.pathname, navigate]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const { ok, list } = await loadFilteredList();
        if (!ok) {
          return;
        }
        setTotalPages(Math.ceil(list.length / ITEMS_PER_PAGE) || 1);
        setProducts(
          list.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
          )
        );
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting Products: " + error
        );
      }
    };

    getProducts();
  }, [
    currentPage,
    isSearching,
    searchValue,
    selectedCategoryId,
    supplierFilterId,
    loadFilteredList,
  ]);

  const handleDownloadPdf = async () => {
    try {
      const { ok, list, message: errMsg } = await loadFilteredList();
      if (!ok) {
        showMessage(errMsg || "Unable to generate PDF");
        return;
      }
      if (list.length === 0) {
        showMessage("No products to include in PDF");
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Product Listing", 14, 18);
      doc.setFontSize(10);
      doc.text(
        `Total products: ${list.length}${
          isSearching && searchValue.trim() !== ""
            ? ` | Filter: "${searchValue.trim()}"`
            : ""
        }`,
        14,
        24
      );

      const tableColumn = [
        "Name",
        "SKU",
        "Supplier",
        "Price",
        "Quantity",
        "Availability",
      ];
      const tableRows = list.map((p) => [
        p.name ?? "",
        p.sku ?? "",
        p.supplierName ?? "N/A",
        String(p.price ?? ""),
        String(p.stockQuantity ?? ""),
        getAvailabilityStatus(p.stockQuantity),
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0, 128, 128] },
      });

      doc.save("products.pdf");
    } catch (error) {
      console.error(error);
      showMessage("Error generating PDF: " + error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this Product?")) {
      try {
        await ApiService.deleteProduct(productId);
        showMessage("Product sucessfully Deleted");
        window.location.reload();
      } catch (error) {
        showMessage(
          error.response?.data?.message ||
            "Error Deleting in a product: " + error
        );
      }
    }
  };

  const clearSupplierFilter = () => {
    setSupplierFilterId(null);
    setCurrentPage(1);
  };

  return {
    products,
    message,
    userProfile,
    searchValue,
    setSearchValue,
    isSearching,
    setIsSearching,
    selectedProduct,
    setSelectedProduct,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    supplierFilterId,
    currentPage,
    setCurrentPage,
    totalPages,
    isAdmin,
    isManagerView,
    navigate,
    showMessage,
    handleDownloadPdf,
    handleDeleteProduct,
    clearSupplierFilter,
    runSearch: () => {
      setCurrentPage(1);
      setIsSearching(searchValue.trim() !== "");
    },
    clearSearch: () => {
      setSearchValue("");
      setIsSearching(false);
      setCurrentPage(1);
    },
    onCategoryChange: (value) => {
      setSelectedCategoryId(value);
      setCurrentPage(1);
    },
  };
}
