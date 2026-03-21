import { NextRequest } from 'next/server';

import { isUploadThingServerHookRequest } from '@/infra/upload/route-handler';

import { describe, expect, it } from 'vitest';

describe('isUploadThingServerHookRequest', () => {
  it('is true for UploadThing callback and error hooks', () => {
    expect(
      isUploadThingServerHookRequest(
        new NextRequest('https://localhost/api/uploadthing?slug=x', {
          headers: { 'uploadthing-hook': 'callback' },
        }),
      ),
    ).toBe(true);
    expect(
      isUploadThingServerHookRequest(
        new NextRequest('https://localhost/api/uploadthing?slug=x', {
          headers: { 'uploadthing-hook': 'error' },
        }),
      ),
    ).toBe(true);
    expect(
      isUploadThingServerHookRequest(
        new NextRequest('https://localhost/api/uploadthing?slug=x', {
          headers: { 'uploadthing-hook': 'Callback' },
        }),
      ),
    ).toBe(true);
  });

  it('is false for browser-initiated upload POSTs', () => {
    expect(
      isUploadThingServerHookRequest(
        new NextRequest('https://localhost/api/uploadthing?actionType=upload&slug=x'),
      ),
    ).toBe(false);
    expect(
      isUploadThingServerHookRequest(
        new NextRequest('https://localhost/api/uploadthing?slug=x', {
          headers: { 'uploadthing-hook': 'something-else' },
        }),
      ),
    ).toBe(false);
  });
});
