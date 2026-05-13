import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import { normalizeSupplierRow } from "../utils/normalizeSupplier";

const AddEditSupplierPage = () => {
  const { supplierId } = useParams();
  const isEditing = Boolean(supplierId);

  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [goodsSupplied, setGoodsSupplied] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const navigate = useNavigate();

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  useEffect(() => {
    if (!supplierId) return;

    const fetchSupplier = async () => {
      setFetching(true);
      try {
        const supplierData = await ApiService.getSupplierById(supplierId);
        if (supplierData.status === 200 && supplierData.supplier) {
          const s = normalizeSupplierRow(supplierData.supplier);
          const asText = (v) => (v == null || v === undefined ? "" : String(v));
          setName(asText(s.name));
          setContactInfo(asText(s.contactInfo));
          setAddress(asText(s.address));
          setEmail(asText(s.email ?? s.Email ?? s.supplierEmail ?? s.businessEmail));
          setPhone(asText(s.phone));
          setCompany(asText(s.company));
          setNotes(asText(s.notes));
          setGoodsSupplied(asText(s.goodsSupplied));
          setQuantity(s.quantity != null ? String(s.quantity) : "");
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error loading supplier: " + error
        );
      } finally {
        setFetching(false);
      }
    };
    fetchSupplier();
  }, [supplierId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qtyRaw = quantity.trim();
    let qtyParsed = null;
    if (qtyRaw !== "") {
      const n = parseInt(qtyRaw, 10);
      if (Number.isNaN(n) || n < 0) {
        showMessage("Quantity must be a whole number ≥ 0.");
        return;
      }
      qtyParsed = n;
    }

    const supplierData = {
      name: name.trim(),
      contactInfo: contactInfo.trim(),
      address: address.trim() || null,
      email: email.trim(),
      phone: phone.trim() || null,
      company: company.trim() || null,
      notes: notes.trim() || null,
      goodsSupplied: goodsSupplied.trim() || null,
      quantity: qtyParsed,
    };

    setLoading(true);
    try {
      if (isEditing) {
        await ApiService.updateSupplier(supplierId, supplierData);
        showMessage("Supplier updated successfully.");
      } else {
        await ApiService.addSupplier(supplierData);
        showMessage("Supplier added successfully.");
      }
      setTimeout(() => navigate("/supplier"), 600);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error saving supplier: " + error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {message && <div className="message">{message}</div>}
      <div className="supplier-form-page supplier-form-modern">
        <h1>{isEditing ? "Edit supplier" : "Add supplier"}</h1>
        <p className="supplier-form-lead">
          {isEditing
            ? "Update vendor details. Products linked to this supplier keep their assignments."
            : "Create a vendor record for purchases and stock-in flows."}
        </p>

        {fetching ? (
          <p className="muted-text">Loading supplier…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="supplier-form-grid">
              <div className="form-group">
                <label htmlFor="sup-name">Supplier name *</label>
                <input
                  id="sup-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  type="text"
                  placeholder="e.g. Acme Wholesale"
                  autoComplete="organization"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sup-company">Company</label>
                <input
                  id="sup-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  type="text"
                  placeholder="e.g. ABC Supplies Ltd."
                  autoComplete="organization"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sup-email">Email</label>
                <input
                  id="sup-email"
                  name="supplierBusinessEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="supplier@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sup-phone">Phone</label>
                <input
                  id="sup-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder="+1 …"
                  autoComplete="tel"
                />
              </div>

              <div className="form-group supplier-form-grid-span">
                <label htmlFor="sup-contact">Primary contact *</label>
                <input
                  id="sup-contact"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  required
                  type="text"
                  placeholder="e.g. Warehouse receiving desk"
                />
              </div>

              <div className="form-group supplier-form-grid-span">
                <label htmlFor="sup-address">Address *</label>
                <input
                  id="sup-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  type="text"
                  placeholder="Street, city, region"
                  autoComplete="street-address"
                />
              </div>

              <div className="form-group supplier-form-grid-span">
                <label htmlFor="sup-goods">Goods supplied</label>
                <input
                  id="sup-goods"
                  value={goodsSupplied}
                  onChange={(e) => setGoodsSupplied(e.target.value)}
                  type="text"
                  placeholder="e.g. Electronics, cables, raw materials"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sup-qty">Stock capacity (units)</label>
                <input
                  id="sup-qty"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Optional planning figure"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sup-notes">Notes / remarks</label>
              <textarea
                id="sup-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, delivery schedule, certifications…"
                rows={4}
                className="supplier-form-textarea"
              />
            </div>

            <div className="supplier-form-actions">
              <button
                type="button"
                className="btn btn-ghost btn-md"
                onClick={() => navigate("/supplier")}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-md" disabled={loading}>
                {loading ? "Saving…" : isEditing ? "Update supplier" : "Add supplier"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default AddEditSupplierPage;
