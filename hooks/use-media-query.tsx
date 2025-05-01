'use client';

import { useEffect, useState } from 'react';

// Common breakpoints for our application
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  reduced: '(prefers-reduced-motion: reduce)',
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Custom hook for responsive design and media queries
 * @param query - Media query string or predefined breakpoint key
 * @returns boolean indicating if the media query matches
 * @example
 * // Using predefined breakpoint
 * const isLarge = useMediaQuery('lg');
 * // Using custom query
 * const isPortrait = useMediaQuery('(orientation: portrait)');
 */
export function useMediaQuery(query: string | Breakpoint): boolean {
  // Default to false during SSR
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Get the actual query string
    const mediaQuery = breakpoints[query as Breakpoint] || query;

    // Create media query list
    const media = window.matchMedia(mediaQuery);

    // Set initial value
    setMatches(media.matches);

    // Define listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Convenience hooks for common queries
export function useIsMobile() {
  return !useMediaQuery('sm');
}

export function useIsTablet() {
  return useMediaQuery('md');
}

export function useIsDesktop() {
  return useMediaQuery('lg');
}

export function usePrefersDark() {
  return useMediaQuery('dark');
}

export function usePrefersReducedMotion() {
  return useMediaQuery('reduced');
}