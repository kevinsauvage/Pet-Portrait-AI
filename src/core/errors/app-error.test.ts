import {
  AppError,
  ExternalServiceError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './app-error';

import { describe, expect, it } from 'vitest';

describe('AppError', () => {
  it('creates an error with correct properties', () => {
    const err = new AppError('Something broke', 'BROKEN', 500, { detail: 'ctx' });
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('Something broke');
    expect(err.code).toBe('BROKEN');
    expect(err.statusCode).toBe(500);
    expect(err.context).toEqual({ detail: 'ctx' });
    expect(err.name).toBe('AppError');
  });

  it('defaults statusCode to 500', () => {
    const err = new AppError('msg', 'CODE');
    expect(err.statusCode).toBe(500);
  });
});

describe('NotFoundError', () => {
  it('creates a 404 error with resource name', () => {
    const err = new NotFoundError('Product');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Product not found');
    expect(err.name).toBe('NotFoundError');
  });

  it('includes id in message when provided', () => {
    const err = new NotFoundError('Order', '123');
    expect(err.message).toBe('Order with id "123" not found');
  });
});

describe('ValidationError', () => {
  it('creates a 400 error', () => {
    const err = new ValidationError('Invalid email');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Invalid email');
    expect(err.name).toBe('ValidationError');
  });

  it('accepts optional context', () => {
    const err = new ValidationError('Bad input', { field: 'email' });
    expect(err.context).toEqual({ field: 'email' });
  });
});

describe('UnauthorizedError', () => {
  it('creates a 401 error with default message', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.message).toBe('Unauthorized');
    expect(err.name).toBe('UnauthorizedError');
  });

  it('accepts a custom message', () => {
    const err = new UnauthorizedError('Token expired');
    expect(err.message).toBe('Token expired');
  });
});

describe('ExternalServiceError', () => {
  it('creates a 502 error with service name', () => {
    const err = new ExternalServiceError('Shopify');
    expect(err.statusCode).toBe(502);
    expect(err.code).toBe('EXTERNAL_SERVICE_ERROR');
    expect(err.message).toContain('Shopify');
    expect(err.name).toBe('ExternalServiceError');
  });

  it('includes original error message', () => {
    const original = new Error('Connection refused');
    const err = new ExternalServiceError('Stripe', original);
    expect(err.message).toContain('Connection refused');
    expect(err.context?.service).toBe('Stripe');
  });
});
