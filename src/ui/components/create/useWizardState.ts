'use client';

import { useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { ArtStyleId } from '@/domains/ai/ai-portrait/types';

export type WizardStep = 'upload' | 'style' | 'generating' | 'select' | 'add-to-cart';

export interface ArtworkState {
  urls: string[];
  generationId: string;
  styleId: ArtStyleId;
}

interface SessionData {
  originalPhotoUrl?: string;
  artworkUrls?: string[];
  selectedArtworkUrl?: string;
}

const SESSION_KEY = 'wizard_session';

function readSession(): SessionData {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionData) : {};
  } catch {
    return {};
  }
}

function writeSession(patch: Partial<SessionData>): void {
  try {
    const prev = readSession();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...prev, ...patch }));
  } catch {
    // sessionStorage unavailable (private browsing edge case) — degrade gracefully
  }
}

function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

const VALID_STEPS: WizardStep[] = ['upload', 'style', 'generating', 'select', 'add-to-cart'];

function isValidStep(val: string | null): val is WizardStep {
  return VALID_STEPS.includes(val as WizardStep);
}

export function useWizardState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL-sourced params (lightweight, bookmarkable)
  const stepParam = searchParams.get('step');
  const generationId = searchParams.get('generationId') ?? undefined;
  const styleIdParam = searchParams.get('styleId') as ArtStyleId | null;

  // Derive step from URL, default to 'upload'
  const step: WizardStep = isValidStep(stepParam) ? stepParam : 'upload';

  // Volatile data from sessionStorage — lazily read once via state initializer
  const [originalPhotoUrl, setOriginalPhotoUrlState] = useState<string | null>(() => {
    const session = readSession();
    return session.originalPhotoUrl ?? null;
  });

  const [artworkUrls, setArtworkUrlsState] = useState<string[]>(() => {
    const session = readSession();
    return session.artworkUrls ?? [];
  });

  const [selectedArtworkUrl, setSelectedArtworkUrlState] = useState<string | null>(() => {
    const session = readSession();
    return session.selectedArtworkUrl ?? null;
  });

  // Helpers to build URL params
  const buildParams = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(overrides)) {
        if (v === undefined) {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      }
      return params.toString();
    },
    [searchParams],
  );

  const navigate = useCallback(
    (newStep: WizardStep, extra?: Record<string, string | undefined>) => {
      const qs = buildParams({ step: newStep, ...extra });
      router.push(`${pathname}?${qs}`);
    },
    [router, pathname, buildParams],
  );

  // ── Actions ──────────────────────────────────────────────────────────────

  const setOriginalPhotoUrl = useCallback((url: string) => {
    setOriginalPhotoUrlState(url);
    writeSession({ originalPhotoUrl: url });
  }, []);

  const setArtwork = useCallback(
    (artwork: ArtworkState) => {
      setArtworkUrlsState(artwork.urls);
      writeSession({ artworkUrls: artwork.urls });
      navigate('select', {
        generationId: artwork.generationId,
        styleId: artwork.styleId,
      });
    },
    [navigate],
  );

  const setSelectedArtworkUrl = useCallback((url: string) => {
    setSelectedArtworkUrlState(url);
    writeSession({ selectedArtworkUrl: url });
  }, []);

  const goToStep = useCallback(
    (newStep: WizardStep) => {
      navigate(newStep);
    },
    [navigate],
  );

  const reset = useCallback(() => {
    clearSession();
    setOriginalPhotoUrlState(null);
    setArtworkUrlsState([]);
    setSelectedArtworkUrlState(null);
    router.push(pathname);
  }, [router, pathname]);

  // Derived artwork state from URL + sessionStorage
  const artwork: ArtworkState | null =
    generationId && styleIdParam && artworkUrls.length
      ? { urls: artworkUrls, generationId, styleId: styleIdParam }
      : null;

  return {
    step,
    originalPhotoUrl,
    artwork,
    selectedArtworkUrl,
    styleId: styleIdParam,
    // Preselected style from URL (for /create?style=pixar entry point)
    preselectedStyleId: !stepParam ? (searchParams.get('style') as ArtStyleId | null) : null,
    setOriginalPhotoUrl,
    setArtwork,
    setSelectedArtworkUrl,
    goToStep,
    reset,
  };
}
