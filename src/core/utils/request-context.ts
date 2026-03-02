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
 * Get the current request context from AsyncLocalStorage
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

/**
 * Run a function with a request context
 */
export function runWithRequestContext<T>(context: Partial<RequestContext>, fn: () => T): T {
  return requestContextStorage.run(createFullContext(context), fn);
}

/**
 * Run an async function with a request context
 */
export async function runWithRequestContextAsync<T>(
  context: Partial<RequestContext>,
  fn: () => Promise<T>,
): Promise<T> {
  return requestContextStorage.run(createFullContext(context), fn);
}

/**
 * Set additional context on the current request
 */
export function setRequestContext(context: Partial<RequestContext>): void {
  const current = getRequestContext();
  if (!current) {
    throw new Error('Cannot set request context outside of a request context');
  }

  Object.assign(current, context);
}
