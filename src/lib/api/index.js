// ── Core HTTP client ──────────────────────────────────────────────────────────
export { fetchWithCredentials, extractErrorMessage, API_BASE_URL } from './httpClient';

// ── Domain APIs ───────────────────────────────────────────────────────────────
export { AuthAPI }          from './auth.api';
export { RegistrationAPI }  from './registration.api';
export { CustomerAPI }      from './customer.api';
export { SearchAPI }        from './search.api';
export { ReviewsAPI }       from './reviews.api';
export { PromotionsAPI }    from './promotions.api';
export { AdminAPI }         from './admin.api';

// ── Vendor APIs ───────────────────────────────────────────────────────────────
export { VendorProductsAPI }  from './vendor/products.api';
export { VendorOrdersAPI }    from './vendor/orders.api';
export { VendorAnalyticsAPI } from './vendor/analytics.api';
export { VendorProfileAPI }   from './vendor/profile.api';
export { VendorReviewsAPI }   from './vendor/reviews.api';
