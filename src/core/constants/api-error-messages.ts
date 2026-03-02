/**
 * Common API error messages used across API routes.
 * Centralized to ensure consistency and make updates easier.
 * Messages are user-friendly and actionable.
 */
export const API_ERROR_MESSAGES = {
  CART_NOT_FOUND: 'Your cart could not be found. Please try adding items again.',
  USER_NOT_FOUND: 'User account not found.',
  INVALID_REQUEST_BODY: 'The request is invalid. Please check your input and try again.',
  MISSING_PRODUCT_ID: 'Product ID is required.',
  MISSING_OR_INVALID_PRODUCT_ID: 'A valid product ID is required.',
  MISSING_LINE_ITEM_ID: 'Line item ID is required.',
  INVALID_DISCOUNT_CODES_FORMAT: 'Invalid discount code format. Please check and try again.',
  FAILED_TO_UPDATE_CART_BUYER_IDENTITY: 'Unable to update cart information. Please try again.',
  FAILED_TO_UPDATE_DISCOUNT_CODES: 'Unable to apply discount code. Please check the code and try again.',
  FAILED_TO_ADD_PRODUCT: 'Unable to add item to cart. Please try again.',
  FAILED_TO_UPDATE_CART: 'Unable to update cart. Please try again.',
  FAILED_TO_REMOVE_PRODUCT: 'Unable to remove item from cart. Please try again.',
  FAILED_TO_FETCH_CART: 'Unable to load your cart. Please refresh the page.',
  FAILED_TO_ADD_PRODUCT_TO_WISHLIST: 'Unable to add item to wishlist. Please try again.',
  FAILED_TO_REMOVE_PRODUCT_FROM_WISHLIST: 'Unable to remove item from wishlist. Please try again.',
  FAILED_TO_FETCH_WISHLIST: 'Unable to load your wishlist. Please refresh the page.',
  FAILED_TO_UPDATE_CART_LINES: 'Unable to update cart items. Please try again.',
  FAILED_TO_REMOVE_CART_LINE: 'Unable to remove item from cart. Please try again.',
  FAILED_TO_LOGOUT: 'Unable to sign out. Please try again.',
  FAILED_TO_FETCH_ADMIN_GENERATIONS: 'Unable to load generation data.',
  FAILED_TO_FETCH_PREDICTIVE_SEARCH: 'Unable to load search suggestions. Please try again.',
  AI_PORTRAIT_GENERATION_FAILED: 'Unable to generate portrait. Please try again or contact support if the issue persists.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
  TOO_MANY_REQUESTS: 'Too many requests. Please wait a moment and try again.',
} as const;
