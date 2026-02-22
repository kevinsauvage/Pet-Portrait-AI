import { type NextRequest } from 'next/server';

import { createErrorResponse, createSuccessResponse, HTTP_STATUS } from '@/core/utils/api-responses';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const {CRON_SECRET} = process.env;

/**
 * Vercel Cron: Sync Gelato order tracking to Shopify.
 * Configure in vercel.json:
 *   "crons": [{ "path": "/api/cron/sync-gelato-tracking", "schedule": "0 * * * *" }]
 *
 * Requires: CRON_SECRET, GELATO_API_KEY, Shopify Admin API credentials.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.replace('Bearer ', '');
  if (CRON_SECRET && bearerToken !== CRON_SECRET) {
    return createErrorResponse('Unauthorized', {
      status: HTTP_STATUS.UNAUTHORIZED,
    });
  }

  try {
    if (!process.env.GELATO_API_KEY) {
      return createSuccessResponse({
        synced: 0,
        message: 'Gelato API not configured',
      });
    }

    // TODO: Implement Gelato order status fetch + Shopify fulfillment update
    // 1. GET https://order.gelatoapis.com/v4/orders?orderReferenceId=shopify-*
    // 2. For each order with tracking, update Shopify fulfillment via Admin API
    return createSuccessResponse({
      synced: 0,
      message:
        'Tracking sync placeholder. Implement Gelato orders fetch + Shopify fulfillments update.',
    });
  } catch (error) {
    console.error('[cron/sync-gelato-tracking]', error);
    return createErrorResponse('Tracking sync failed', {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
}
