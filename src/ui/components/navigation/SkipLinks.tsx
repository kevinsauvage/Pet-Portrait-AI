'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

/**
 * Skip Links Component
 *
 * Provides keyboard-accessible skip links for main content areas.
 * Visible when focused (keyboard navigation) to allow users to skip
 * repetitive navigation elements.
 *
 * WCAG 2.4.1: Bypass Blocks - Level A
 */
const SkipLinks = () => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#main-navigation', label: 'Skip to navigation' },
    { href: '#footer', label: 'Skip to footer' },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        // Track which skip link is focused
        const links = document.querySelectorAll<HTMLAnchorElement>('.skip-link');
        const currentIndex = Array.from(links).findIndex((link) => link === document.activeElement);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav
      aria-label="Skip links"
      className="sr-only focus-within:absolute focus-within:z-50 focus-within:left-4 focus-within:top-4 focus-within:block focus-within:w-auto focus-within:h-auto focus-within:overflow-visible focus-within:clip-auto focus-within:whitespace-normal"
    >
      <ul className="flex flex-col gap-2">
        {skipLinks.map((link, index) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={cn(
                'skip-link',
                'inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'hover:bg-primary/90',
                focusedIndex === index && 'ring-2 ring-primary ring-offset-2',
              )}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SkipLinks;
