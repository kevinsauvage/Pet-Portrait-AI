import type { ApiErrorResponse, ApiResponse } from '@/core/utils/api-responses';
import { extractErrorMessage } from '@/core/utils/extract-error-message';
import { getBaseUrl } from '@/core/utils/metadata';

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

type ApiClientOptions = {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
};

function getAbsoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const baseUrl = getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

function isErrorResponse(data: unknown): data is ApiErrorResponse {
  return typeof data === 'object' && data !== null && 'error' in data;
}

export async function apiClient<T = unknown>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, cache } = options;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    cache,
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const absoluteUrl = getAbsoluteUrl(path);
    const response = await fetch(absoluteUrl, requestOptions);

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiResponse<T>;
      const errorMessage = extractErrorMessage(errorData, `API request failed: ${response.statusText}`);
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as ApiResponse<T> | T;

    if (isErrorResponse(data)) {
      throw new Error(extractErrorMessage(data, data.error));
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during API request', { cause: error });
  }
}

export const api = {
  get: <T = unknown>(path: string, options?: Omit<ApiClientOptions, 'method' | 'body'>) =>
    apiClient<T>(path, { ...options, method: 'GET' }),

  post: <T = unknown>(path: string, body?: unknown, options?: Omit<ApiClientOptions, 'method'>) =>
    apiClient<T>(path, { ...options, method: 'POST', body }),

  patch: <T = unknown>(path: string, body?: unknown, options?: Omit<ApiClientOptions, 'method'>) =>
    apiClient<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(path: string, options?: Omit<ApiClientOptions, 'method' | 'body'>) =>
    apiClient<T>(path, { ...options, method: 'DELETE' }),

  put: <T = unknown>(path: string, body?: unknown, options?: Omit<ApiClientOptions, 'method'>) =>
    apiClient<T>(path, { ...options, method: 'PUT', body }),
};
