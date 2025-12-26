import { useState, useEffect } from 'react';
import { debounce, getViewportSize } from '../utils/mobileOptimization';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
}

/**
 * Custom hook for responsive design
 * Returns current viewport info and updates on resize
 */
export const useResponsive = (): ViewportInfo => {
  const getBreakpoint = (width: number): Breakpoint => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1536) return 'desktop';
    return 'wide';
  };

  const getViewportInfo = (): ViewportInfo => {
    const { width, height } = getViewportSize();
    const breakpoint = getBreakpoint(width);

    return {
      width,
      height,
      breakpoint,
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop',
      isWide: breakpoint === 'wide',
    };
  };

  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(getViewportInfo());

  useEffect(() => {
    const handleResize = debounce(() => {
      setViewportInfo(getViewportInfo());
    }, 150);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
    // getViewportInfo is a pure function, doesn't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return viewportInfo;
};

/**
 * Custom hook for media query matching
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    // Legacy browsers
    else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
};

/**
 * Custom hook for touch device detection
 */
export const useTouch = (): boolean => {
  const [isTouch] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  return isTouch;
};

/**
 * Custom hook for reduced motion preference
 */
export const usePrefersReducedMotion = (): boolean => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};
