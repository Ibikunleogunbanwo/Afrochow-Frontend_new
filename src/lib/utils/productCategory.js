/**
 * Categories where a "prep time" / "ready in X min" claim doesn't make sense —
 * groceries and farm produce are pre-packaged/raw goods, not cooked-to-order
 * food. Matched by keyword rather than exact string because the same concept
 * shows up under different labels in different places:
 *   - Product.category (global taxonomy, e.g. FeaturedProductCard's categoryName): "African Groceries", "Farm Produce"
 *   - VendorProfile.storeCategory, real vendor registration (StoreCategory enum): "African Grocery Store", "Farm Produce"
 *   - VendorProfile.storeCategory, seeded demo vendors: "African Groceries", "Farm Produce"
 * A case-insensitive substring check on "grocery"/"groceries"/"produce" covers
 * all three without needing them to match exactly.
 */
export const isGroceryOrProduceCategory = (categoryText) => {
    if (!categoryText) return false;
    const normalized = categoryText.toLowerCase();
    return normalized.includes('grocery')
        || normalized.includes('groceries')
        || normalized.includes('produce');
};
