import {
  CREATE_FLOW_STORED_URL_MAX_LENGTH,
  parseCreateFlowStoredUrl,
} from './validate-create-flow-stored-url';

import { describe, expect, it } from 'vitest';

describe('parseCreateFlowStoredUrl', () => {
  it('accepts /create and subpaths with query', () => {
    expect(parseCreateFlowStoredUrl('/create')).toEqual({ ok: true, value: '/create' });
    expect(parseCreateFlowStoredUrl('/create/style?photo=x')).toEqual({
      ok: true,
      value: '/create/style?photo=x',
    });
    expect(parseCreateFlowStoredUrl('  /create/order?artwork=y  ')).toEqual({
      ok: true,
      value: '/create/order?artwork=y',
    });
  });

  it('normalizes missing leading slash', () => {
    expect(parseCreateFlowStoredUrl('create/style')).toEqual({
      ok: true,
      value: '/create/style',
    });
  });

  it('rejects paths outside /create', () => {
    expect(parseCreateFlowStoredUrl('/admin').ok).toBe(false);
    expect(parseCreateFlowStoredUrl('/createevil').ok).toBe(false);
    expect(parseCreateFlowStoredUrl('/foo/create').ok).toBe(false);
  });

  it('rejects encoded dot-dot segments', () => {
    expect(parseCreateFlowStoredUrl('/create/%2e%2e%2faccount').ok).toBe(false);
  });

  it('rejects absolute and protocol-relative URLs', () => {
    expect(parseCreateFlowStoredUrl('https://evil.test/create/style').ok).toBe(false);
    expect(parseCreateFlowStoredUrl('//evil.test/create').ok).toBe(false);
    expect(parseCreateFlowStoredUrl('javascript:alert(1)').ok).toBe(false);
  });

  it('rejects oversized input', () => {
    const long = `/create/style?x=${'a'.repeat(CREATE_FLOW_STORED_URL_MAX_LENGTH)}`;
    expect(parseCreateFlowStoredUrl(long).ok).toBe(false);
  });

  it('rejects empty after trim', () => {
    expect(parseCreateFlowStoredUrl('   ').ok).toBe(false);
    expect(parseCreateFlowStoredUrl('').ok).toBe(false);
  });
});
