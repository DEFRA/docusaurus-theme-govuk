// Shim for @react-foundry/router that bridges React Router v5 (Docusaurus) to
// the v6-style API that @react-foundry/router expects.
//
// This is needed because @react-foundry/router re-exports `Link` and
// `useNavigate` from react-router v6, but Docusaurus ships react-router v5.
// The shim maps v5 equivalents (useHistory, Link from react-router-dom) and
// wires up useIsActive with the real location so @not-govuk components like
// ServiceNavigation can correctly detect the active page.

import { createElement, forwardRef } from 'react';
import {
  useHistory,
  useLocation as _useLocation,
  useParams,
  Link as RouterLink
} from 'react-router-dom';
import { URI } from '@react-foundry/uri';

export { useParams };

// @react-foundry/anchor sets `hash: '#'` on internal links that have no hash.
// Docusaurus only scrolls to the top after navigation when the hash is empty,
// so an empty '#' leaves the new page at the old scroll position and adds a
// trailing '#' to the URL. Drop it before handing off to react-router.
const stripEmptyHash = (to) =>
  to && typeof to === 'object' && to.hash === '#' ? { ...to, hash: '' } : to;

export const Link = forwardRef(({ to, ...props }, ref) =>
  createElement(RouterLink, { ...props, innerRef: ref, to: stripEmptyHash(to) })
);
Link.displayName = 'Link';

export const needSuspense = false;

// Enhance location with parsed query string (matches @react-foundry/router API)
const enhanceLocation = (location) => ({
  ...location,
  query: Object.fromEntries(new URLSearchParams(location.search ?? ''))
});

export const useLocation = () => enhanceLocation(_useLocation());

// Build useIsActive from the real location (mirrors @react-foundry/router/is-active)
const includes = (haystack, needle) => {
  if (Array.isArray(needle)) {
    return needle.length === haystack.length
      && needle.every((v, i) => includes(haystack[i], v));
  }
  if (typeof needle === 'object') {
    return typeof haystack === 'object'
      && Object.keys(needle).every((k) => includes(haystack[k], needle[k]));
  }
  return needle === haystack;
};

export const useIsActive = () => {
  const location = useLocation();

  return (href) => {
    const target = URI.parse(href, location.pathname);
    const pathMatch = location.pathname === target.pathname;
    const queryMatch = includes(location.query, target.query);
    // Home link: exact match only (must match exactly, not as a prefix)
    if (
      target.pathname === '/' ||
      /^\/[^/]+\/?$/.test(target.pathname) // e.g. /interactive-map or /interactive-map/
    ) {
      // Only highlight if the current path matches the home link's pathname exactly
      return location.pathname === target.pathname && queryMatch;
    }
    // Overview link: href is a prefix of current path, and next char is '/' or nothing
    const isOverview = location.pathname.startsWith(target.pathname)
      && location.pathname.charAt(target.pathname.length) === '/';
    if (isOverview) {
      return pathMatch && queryMatch;
    }
    // All other links: startsWith logic
    const dir = target.pathname.endsWith('/') ? target.pathname : target.pathname + '/';
    const pathStart = location.pathname === target.pathname || location.pathname.startsWith(dir);
    return pathStart && queryMatch;
  };
};

// React Router v5 has useHistory, not useNavigate — wrap it
export const useNavigate = () => {
  const history = useHistory();
  return (to) => {
    if (typeof to === 'number') {
      history.go(to);
    } else {
      history.push(stripEmptyHash(to));
    }
  };
};
