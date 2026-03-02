import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export type RequestContext = {
  requestId: string;
  startTime: number;
  path?: string;
  method?: string;
  userId?: string;
  ip?: string;
};

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Creates a full RequestContext from a partial context, filling in defaults.
 * Generates a new requestId if not provided and sets startTime to current time if not provided.
 *
 * @param context - Partial request context to complete
 * @returns Complete RequestContext with all required fields
 */
function createFullContext(context: Partial<RequestContext>): RequestContext {
  return {
    requestId: context.requestId || randomUUID(),
    startTime: context.startTime || Date.now(),
    path: context.path,
    method: context.method,
    userId: context.userId,
    ip: context.ip,
  };
}

/**
 * Gets the current request context from AsyncLocalStorage.
 * Returns undefined if called outside of a request context.
 *
 * @returns The current RequestContext or undefined if not in a request context
 *
 * @example
 * ```ts
 * const ctx = getRequestContext();
 * if (ctx) {
 *   console.log(`Request ID: ${ctx.requestId}`);
 * }
 * ```
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

/**
 * Runs a synchronous function within a request context.
 * The context is available to all nested async operations via AsyncLocalStorage.
 *
 * @param context - Partial request context (missing fields will be auto-generated)
 * @param fn - Synchronous function to execute within the context
 * @returns The return value of the function
 *
 * @example
 * ```ts
 * const result = runWithRequestContext(
 *   { path: '/api/users', method: 'GET' },
 *   () => {
 *     // This code and all nested async operations have access to the context
 *     const ctx = getRequestContext();
 *     return processRequest();
 *   }
 * );
 * ```
 */
export function runWithRequestContext<T>(context: Partial<RequestContext>, fn: () => T): T {
  return requestContextStorage.run(createFullContext(context), fn);
}

/**
 * Runs an async function within a request context.
 * The context is available to all nested async operations via AsyncLocalStorage.
 *
 * @param context - Partial request context (missing fields will be auto-generated)
 * @param fn - Async function to execute within the context
 * @returns Promise that resolves to the return value of the function
 *
 * @example
 * ```ts
 * const result = await runWithRequestContextAsync(
 *   { path: '/api/users', method: 'GET', userId: '123' },
 *   async () => {
 *     // This code and all nested async operations have access to the context
 *     const ctx = getRequestContext();
 *     return await fetchUserData();
 *   }
 * );
 * ```
 */
export async function runWithRequestContextAsync<T>(
  context: Partial<RequestContext>,
  fn: () => Promise<T>,
): Promise<T> {
  return requestContextStorage.run(createFullContext(context), fn);
}

/**
 * Updates the current request context with additional fields.
 * Throws an error if called outside of a request context.
 *
 * @param context - Partial context fields to merge into the current context
 * @throws {Error} If called outside of a request context
 *
 * @example
 * ```ts
 * // After initial context is set
 * setRequestContext({ userId: '123', ip: '192.168.1.1' });
 * ```
 */
export function setRequestContext(context: Partial<RequestContext>): void {
  const current = getRequestContext();
  if (!current) {
    throw new Error('Cannot set request context outside of a request context');
  }

  Object.assign(current, context);
}
