/**
 * Map supplier JSON from the API to a single camelCase shape (handles snake_case / aliases).
 */
export function normalizeSupplierRow(raw) {
  if (!raw || typeof raw !== "object") return raw;
  return {
    ...raw,
    contactInfo: raw.contactInfo ?? raw.contact_info ?? raw.ContactInfo ?? "",
    address: raw.address ?? raw.Address ?? "",
    company: raw.company ?? raw.Company ?? raw.company_name ?? raw.companyName ?? "",
    email: raw.email ?? raw.Email ?? raw.supplierEmail ?? raw.businessEmail ?? "",
    phone: raw.phone ?? raw.Phone ?? raw.phone_number ?? raw.phoneNumber ?? raw.mobile ?? "",
    goodsSupplied:
      raw.goodsSupplied ?? raw.goods_supplied ?? raw.GoodsSupplied ?? raw.goodsSuppliedText ?? "",
    notes: raw.notes ?? raw.Notes ?? "",
  };
}

export function supplierTextCell(value) {
  if (value == null || String(value).trim() === "") return "—";
  return String(value).trim();
}
