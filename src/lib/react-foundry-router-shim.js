// Shim for @react-foundry/router that bridges React Router v5 (Docusaurus) to
// the v6-style API that @react-foundry/router expects.
//
// This is needed because @react-foundry/router re-exports `Link` and
// `useNavigate` from react-router v6, but Docusaurus ships react-router v5.
// The shim maps v5 equivalents (useHistory, Link from react-router-dom) and
// wires up useIsActive with the real location so @not-govuk components like
// ServiceNavigation can correctly detect the active page.

import { useLocation as _useLocation, useParams, Link } from 'react-router-dom';
import { URI } from '@react-foundry/uri';

export { useParams, Link };

export const needSuspense = false;

// Enhance location with parsed query string (matches @react-foundry/router API)
const enhanceLocation = (location) => {
  const search = location.search || '';
  const params = new URLSearchParams(search);
  const query = {};
  for (const [key, value] of params.entries()) {
    query[key] = value;
  }
  return { ...location, query };
};

export const useLocation = () => enhanceLocation(_useLocation());

// Build useIsActive from the real location (mirrors @react-foundry/router/is-active)
const includes = (haystack, needle) => {
  const subIncludes = (h, n) =>
    Array.isArray(n)
      ? n.length === h.length && n.every((v, i) => subIncludes(h[i], v))
      : typeof n === 'object'
        ? typeof h === 'object' && Object.keys(n).every((k) => subIncludes(h[k], n[k]))
        : n === h;
  return subIncludes(haystack, needle);
};

export const useIsActive = () => {
  const location = useLocation();

  return (href, exact = true, options = {}) => {
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
  const { useHistory } = require('react-router-dom');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const history = useHistory();
  return (to) => {
    if (typeof to === 'number') {
      history.go(to);
    } else {
      history.push(to);
    }
  };
};
