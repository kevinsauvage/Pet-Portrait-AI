import { NextRequest } from 'next/server';

import { API_ERROR_MESSAGES } from '@/core/constants/api-error-messages';

import {
  createErrorResponse,
  createSuccessResponse,
  evaluateCartMutation,
  getErrorStatus,
  HTTP_STATUS,
  mapShopifyUserErrors,
  withResolvedApiHandler,
} from './api-responses';

import { describe, expect, it, vi } from 'vitest';

describe('HTTP_STATUS', () => {
  it('has correct numeric values', () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });
});

describe('createErrorResponse', () => {
  it('creates a response with default 500 status', async () => {
    const res = createErrorResponse('Something failed');
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Something failed');
  });

  it('creates a response with custom status', async () => {
    const res = createErrorResponse('Not found', { status: 404 });
    expect(res.status).toBe(404);
  });

  it('includes optional message in body', async () => {
    const res = createErrorResponse('err', { message: 'details here' });
    const body = await res.json();
    expect(body.message).toBe('details here');
  });

  it('includes userErrors when provided and non-empty', async () => {
    const userErrors = [{ field: ['x'], message: 'invalid', __typename: 'UserError' as const }];
    const res = createErrorResponse('err', { userErrors });
    const body = await res.json();
    expect(body.userErrors).toHaveLength(1);
  });

  it('omits userErrors when empty array', async () => {
    const res = createErrorResponse('err', { userErrors: [] });
    const body = await res.json();
    expect(body.userErrors).toBeUndefined();
  });

  it('includes code when provided', async () => {
    const res = createErrorResponse('err', { code: 'CUSTOM_CODE' });
    const body = await res.json();
    expect(body.code).toBe('CUSTOM_CODE');
  });
});

describe('createSuccessResponse', () => {
  it('creates a response with 200 status by default', async () => {
    const res = createSuccessResponse({ id: 1 });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual({ id: 1 });
    expect(body.success).toBe(true);
  });

  it('creates a response with custom status', async () => {
    const res = createSuccessResponse({}, { status: 201 });
    expect(res.status).toBe(201);
  });

  it('includes message when provided', async () => {
    const res = createSuccessResponse({}, { message: 'Created' });
    const body = await res.json();
    expect(body.message).toBe('Created');
  });

  it('adds no-cache headers when noCache is true', () => {
    const res = createSuccessResponse({}, { noCache: true });
    expect(res.headers.get('cache-control')).toContain('no-store');
  });
});

describe('mapShopifyUserErrors', () => {
  it('returns undefined for empty array', () => {
    expect(mapShopifyUserErrors([])).toBeUndefined();
  });

  it('returns undefined for null/undefined', () => {
    expect(mapShopifyUserErrors(null)).toBeUndefined();
    expect(mapShopifyUserErrors(undefined)).toBeUndefined();
  });

  it('maps errors and fills empty messages', () => {
    const errors = [{ field: null, message: '', __typename: 'UserError' as const }];
    const result = mapShopifyUserErrors(errors);
    expect(result?.[0]?.message).toBe('An error occurred');
  });

  it('preserves existing messages', () => {
    const errors = [{ field: null, message: 'Already exists', __typename: 'UserError' as const }];
    const result = mapShopifyUserErrors(errors);
    expect(result?.[0]?.message).toBe('Already exists');
  });
});

describe('evaluateCartMutation', () => {
  it('returns cart when there are no user errors', () => {
    const cart = { id: 'c1' };
    const outcome = evaluateCartMutation({ cart, userErrors: [] }, 'User-facing error');
    expect(outcome.ok).toBe(true);
    if (outcome.ok) expect(outcome.cart).toEqual(cart);
  });

  it('returns 400 when userErrors are present', async () => {
    const userErrors = [{ field: ['x'], message: 'bad', __typename: 'UserError' as const }];
    const outcome = evaluateCartMutation({ cart: null, userErrors }, 'User-facing error');
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.response.status).toBe(400);
      const body = await outcome.response.json();
      expect(body.error).toBe('User-facing error');
      expect(body.userErrors).toHaveLength(1);
    }
  });

  it('returns 500 when cart is missing and there are no user errors', async () => {
    const outcome = evaluateCartMutation({ userErrors: [] }, 'User-facing error');
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.response.status).toBe(500);
      const body = await outcome.response.json();
      expect(body.message).toBe(API_ERROR_MESSAGES.CART_MUTATION_INCOMPLETE);
    }
  });

  it('uses custom detail message when cart is missing', async () => {
    const outcome = evaluateCartMutation(undefined, 'err', { detailMessage: 'custom' });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      const body = await outcome.response.json();
      expect(body.message).toBe('custom');
    }
  });
});

describe('withResolvedApiHandler', () => {
  it('returns the resolve response when resolve does not return a string id', async () => {
    const err = createErrorResponse('missing', { status: HTTP_STATUS.NOT_FOUND });
    const handler = vi.fn();
    const wrapped = withResolvedApiHandler(
      { context: 'test', errorMessage: 'fail' },
      async () => err,
      handler,
    );
    const res = await wrapped(new NextRequest('http://localhost/api'));
    expect(handler).not.toHaveBeenCalled();
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
  });

  it('calls the handler with the resolved id and request', async () => {
    const handler = vi.fn().mockResolvedValue(createSuccessResponse({ ok: true }));
    const wrapped = withResolvedApiHandler(
      { context: 'test', errorMessage: 'fail' },
      async () => 'resolved-id',
      handler,
    );
    const req = new NextRequest('http://localhost/api');
    await wrapped(req);
    expect(handler).toHaveBeenCalledWith('resolved-id', req);
  });

  it('uses withApiHandler error handling when the handler throws', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('boom'));
    const wrapped = withResolvedApiHandler(
      { context: 'test', errorMessage: 'outer fail' },
      async () => 'id',
      handler,
    );
    const res = await wrapped(new NextRequest('http://localhost/api'));
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const body = await res.json();
    expect(body.error).toBe('outer fail');
  });
});

describe('getErrorStatus', () => {
  it('returns default status for non-Error values', () => {
    expect(getErrorStatus('not an error')).toBe(500);
    expect(getErrorStatus(null)).toBe(500);
  });

  it('returns 404 for "not found" messages', () => {
    expect(getErrorStatus(new Error('Resource not found'))).toBe(404);
  });

  it('returns 401 for "unauthorized" messages', () => {
    expect(getErrorStatus(new Error('Unauthorized access'))).toBe(401);
  });

  it('returns 403 for "forbidden" messages', () => {
    expect(getErrorStatus(new Error('Forbidden resource'))).toBe(403);
  });

  it('returns 400 for "invalid" messages', () => {
    expect(getErrorStatus(new Error('Invalid input provided'))).toBe(400);
  });
});
