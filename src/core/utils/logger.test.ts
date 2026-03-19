/* eslint-disable no-console */
import { createPerformanceLogger, logger } from './logger';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logger.info', () => {
    it('calls console.info with the message', () => {
      logger.info('Test info message');
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Test info message'));
    });

    it('includes context in the output', () => {
      logger.info('msg', { context: 'my-service' });
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('[my-service]'));
    });

    it('includes stringified metadata in the output', () => {
      logger.info('msg', { metadata: { key: 'val' } });
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('key'));
    });

    it('redacts long tokens in metadata', () => {
      logger.info('msg', { metadata: { token: 'a'.repeat(33) } });
      const call = (console.info as ReturnType<typeof vi.spyOn>).mock.calls[0][0] as string;
      expect(call).toContain('[REDACTED]');
    });
  });

  describe('logger.warn', () => {
    it('calls console.warn', () => {
      logger.warn('Test warning');
      expect(console.warn).toHaveBeenCalled();
    });

    it('formats error message from an Error object', () => {
      const err = new Error('Something bad');
      logger.warn('msg', { error: err });
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Something bad'), err);
    });
  });

  describe('logger.error', () => {
    it('calls console.error', () => {
      logger.error('Critical failure');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Critical failure'));
    });

    it('handles Error objects and includes message', () => {
      const err = new Error('DB connection failed');
      logger.error('msg', { error: err });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('DB connection failed'),
        err,
      );
    });

    it('handles string errors', () => {
      logger.error('msg', { error: 'plain string error' });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('plain string error'),
        'plain string error',
      );
    });
  });

  describe('logger.debug', () => {
    it('does not log in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      logger.debug('debug msg');
      expect(console.debug).not.toHaveBeenCalled();
      vi.unstubAllEnvs();
    });
  });
});

describe('createPerformanceLogger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns an object with end, getDuration, requestId', () => {
    const perf = createPerformanceLogger('test');
    expect(typeof perf.end).toBe('function');
    expect(typeof perf.getDuration).toBe('function');
    expect(typeof perf.requestId).toBe('string');
  });

  it('end() returns the elapsed duration', () => {
    const perf = createPerformanceLogger('test');
    vi.advanceTimersByTime(500);
    const duration = perf.end();
    expect(duration).toBeGreaterThanOrEqual(500);
  });

  it('getDuration() returns elapsed time without ending', () => {
    const perf = createPerformanceLogger('test');
    vi.advanceTimersByTime(200);
    expect(perf.getDuration()).toBeGreaterThanOrEqual(200);
  });

  it('warns when operation exceeds threshold', () => {
    const perf = createPerformanceLogger('slow-op', 100);
    vi.advanceTimersByTime(200);
    perf.end();
    expect(console.warn).toHaveBeenCalled();
  });
});
