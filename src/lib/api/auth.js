/**
 * @deprecated
 * This file is a backward-compatibility shim.
 * The AuthAPI object now merges all domain APIs so that existing imports
 * (`import { AuthAPI } from '@/lib/api/auth'`) continue to work unchanged.
 *
 * For new code, import from the focused modules instead:
 *   import { AuthAPI }          from '@/lib/api/auth.api'
 *   import { RegistrationAPI }  from '@/lib/api/registration.api'
 *   import { CustomerAPI }      from '@/lib/api/customer.api'
 *   import { SearchAPI }        from '@/lib/api/search.api'
 *   import { ReviewsAPI }       from '@/lib/api/reviews.api'
 *   import { AdminAPI }         from '@/lib/api/admin.api'
 *   import { VendorProductsAPI }  from '@/lib/api/vendor/products.api'
 *   import { VendorOrdersAPI }    from '@/lib/api/vendor/orders.api'
 *   import { VendorAnalyticsAPI } from '@/lib/api/vendor/analytics.api'
 *   import { VendorProfileAPI }   from '@/lib/api/vendor/profile.api'
 *   import { VendorReviewsAPI }   from '@/lib/api/vendor/reviews.api'
 */

import { AuthAPI as _AuthAPI }                from './auth.api';
import { RegistrationAPI }                    from './registration.api';
import { CustomerAPI }                        from './customer.api';
import { SearchAPI }                          from './search.api';
import { ReviewsAPI }                         from './reviews.api';
import { AdminAPI }                           from './admin.api';
import { VendorProductsAPI }                  from './vendor/products.api';
import { VendorOrdersAPI }                    from './vendor/orders.api';
import { VendorAnalyticsAPI }                 from './vendor/analytics.api';
import { VendorProfileAPI }                   from './vendor/profile.api';
import { VendorReviewsAPI }                   from './vendor/reviews.api';

export const AuthAPI = {
  ..._AuthAPI,
  ...RegistrationAPI,
  ...CustomerAPI,
  ...SearchAPI,
  ...ReviewsAPI,
  ...AdminAPI,
  ...VendorProductsAPI,
  ...VendorOrdersAPI,
  ...VendorAnalyticsAPI,
  ...VendorProfileAPI,
  ...VendorReviewsAPI,
};
