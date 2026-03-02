/**
 * Common API error messages used across API routes
 * Centralized to ensure consistency and make updates easier
 */
export const API_ERROR_MESSAGES = {
  CART_NOT_FOUND: 'Cart not found',
  USER_NOT_FOUND: 'User not found',
  INVALID_REQUEST_BODY: 'Invalid request body',
  MISSING_PRODUCT_ID: 'Missing product ID',
  MISSING_OR_INVALID_PRODUCT_ID: 'Missing or invalid product ID',
  MISSING_LINE_ITEM_ID: 'Missing line item ID',
  INVALID_DISCOUNT_CODES_FORMAT: 'Invalid discount codes format',
  FAILED_TO_UPDATE_CART_BUYER_IDENTITY: 'Failed to update cart buyer identity',
  FAILED_TO_UPDATE_DISCOUNT_CODES: 'Failed to update discount codes',
  FAILED_TO_ADD_PRODUCT: 'Failed to add product',
  FAILED_TO_UPDATE_CART: 'Failed to update cart',
  FAILED_TO_REMOVE_PRODUCT: 'Failed to remove product',
  FAILED_TO_FETCH_CART: 'Failed to fetch cart',
  FAILED_TO_ADD_PRODUCT_TO_WISHLIST: 'Failed to add product to wishlist',
  FAILED_TO_REMOVE_PRODUCT_FROM_WISHLIST: 'Failed to remove product from wishlist',
  FAILED_TO_FETCH_WISHLIST: 'Failed to fetch wishlist',
  FAILED_TO_UPDATE_CART_LINES: 'Failed to update cart lines',
  FAILED_TO_REMOVE_CART_LINE: 'Failed to remove cart line',
  FAILED_TO_LOGOUT: 'Failed to logout',
  FAILED_TO_FETCH_ADMIN_GENERATIONS: 'Failed to fetch admin generations',
  FAILED_TO_FETCH_PREDICTIVE_SEARCH: 'Failed to fetch predictive search results',
  AI_PORTRAIT_GENERATION_FAILED: 'AI portrait generation failed',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
} as const;
