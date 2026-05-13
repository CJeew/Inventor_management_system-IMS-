/** Human-readable stock label for product cards, modals, and exports */
export function getAvailabilityStatus(quantity) {
  return Number(quantity) > 0 ? "In Stock" : "Out of Stock";
}
