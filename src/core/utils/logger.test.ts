 
import { createPerformanceLogger, logger, pinoTestSink } from './logger.server';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function parseLastPinoLine() {
  const last = pinoTestSink.lines.at(-1);
  expect(last).toBeDefined();
  return JSON.parse(String(last).trim()) as Record<string, unknown>;
}

describe('logger (server / pino)', () => {
  beforeEach(() => {
    pinoTestSink.lines.length = 0;
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('logger.info', () => {
    it('writes a JSON line with the message', () => {
      logger.info('Test info message');
      const line = parseLastPinoLine();
      expect(line.msg).toBe('Test info message');
      expect(line.level).toBe(30);
    });

    it('includes context in the payload', () => {
      logger.info('msg', { context: 'my-service' });
      const line = parseLastPinoLine();
      expect(line.context).toBe('my-service');
    });

    it('includes metadata in the payload', () => {
      logger.info('msg', { metadata: { key: 'val' } });
      const line = parseLastPinoLine();
      expect(line.key).toBe('val');
    });

    it('redacts long tokens in metadata', () => {
      logger.info('msg', { metadata: { token: 'a'.repeat(33) } });
      const line = parseLastPinoLine();
      expect(line.token).toBe('[REDACTED]');
    });
  });

  describe('logger.warn', () => {
    it('writes a warn-level JSON line', () => {
      logger.warn('Test warning');
      const line = parseLastPinoLine();
      expect(line.msg).toBe('Test warning');
      expect(line.level).toBe(40);
    });

    it('includes formatted error message when error is an Error', () => {
      const err = new Error('Something bad');
      logger.warn('msg', { error: err });
      const line = parseLastPinoLine();
      expect(line.msg).toContain('Something bad');
      expect(line.err).toBeDefined();
    });
  });

  describe('logger.error', () => {
    it('writes an error-level JSON line', () => {
      logger.error('Critical failure');
      const line = parseLastPinoLine();
      expect(line.msg).toBe('Critical failure');
      expect(line.level).toBe(50);
    });

    it('handles Error objects and includes serialized err', () => {
      const err = new Error('DB connection failed');
      logger.error('msg', { error: err });
      const line = parseLastPinoLine();
      expect(line.msg).toContain('DB connection failed');
      expect(line.err).toBeDefined();
    });

    it('handles string errors via errMessage', () => {
      logger.error('msg', { error: 'plain string error' });
      const line = parseLastPinoLine();
      expect(line.msg).toContain('plain string error');
      expect(line.errMessage).toBe('plain string error');
    });
  });

  describe('logger.debug', () => {
    it('does not log in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      logger.debug('debug msg');
      expect(pinoTestSink.lines.length).toBe(0);
    });
  });
});

describe('createPerformanceLogger (server / pino)', () => {
  beforeEach(() => {
    pinoTestSink.lines.length = 0;
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

  it('writes a warn-level line when operation exceeds threshold', () => {
    const perf = createPerformanceLogger('slow-op', 100);
    vi.advanceTimersByTime(200);
    perf.end();
    const line = parseLastPinoLine();
    expect(line.level).toBe(40);
    expect(line.msg).toContain('Slow operation detected');
  });
});
