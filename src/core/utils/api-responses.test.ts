import {
  createErrorResponse,
  createSuccessResponse,
  getErrorStatus,
  HTTP_STATUS,
  mapShopifyUserErrors,
} from './api-responses';

import { describe, expect, it } from 'vitest';

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
