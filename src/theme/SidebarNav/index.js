import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

/**
 * Hash- and pathname-aware sidebar navigation.
 *
 * Works for both anchor-based (auto-generated) and page-based (manual) sidebars.
 *
 * SSR / no-JS: all groups are rendered expanded so content is accessible.
 * CSR after hydration:
 *   - Anchor hrefs (e.g. /api#constructor): active when pathname AND hash both match
 *   - Page hrefs (e.g. /building-a-plugin): active when pathname matches
 *   - Groups expand when the group itself or any child is active
 *
 * State sentinel:
 *   null = not yet hydrated → expand all groups (SSR safe)
 *   str  = JS loaded (empty string means no hash present)
 */
export default function SidebarNav({ items }) {
  const [hash, setHash] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const update = () => setHash(window.location.hash.slice(1));
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  // Split an href into its path and anchor components.
  function parseHref(href) {
    if (!href) return { path: '', anchor: '' };
    const idx = href.indexOf('#');
    if (idx === -1) return { path: href, anchor: '' };
    return { path: href.slice(0, idx) || '/', anchor: href.slice(idx + 1) };
  }

  // Return true if the given href matches the current browser location.
  //   Anchor hrefs: both pathname and hash must match.
  //   Page hrefs:   pathname match is sufficient (exact or child path).
  function isActive(href) {
    const { path, anchor } = parseHref(href);
    if (anchor) {
      return location.pathname === path && hash === anchor;
    }
    return (
      path !== '' &&
      (location.pathname === path || location.pathname.startsWith(path + '/'))
    );
  }

  const cls = 'not-govuk-navigation-menu';
  const lCls = `${cls}__list`;

  return (
    <nav className={cls}>
      <ul className={lCls}>
        {items.map((item, i) => {
          const hasChildren = Array.isArray(item.items) && item.items.length > 0;

          // Pre-hydration (hash === null): expand everything so content is
          // accessible without JS. After hydration: expand only if this group
          // or one of its children is the active location.
          const expanded =
            hasChildren &&
            (hash === null || isActive(item.href) || item.items.some(sub => isActive(sub.href)));

          const active = hash !== null && isActive(item.href);

          return (
            <li
              key={i}
              className={`${lCls}__item${active ? ` ${lCls}__item--active` : ''}`}
            >
              <a href={item.href} className={`${lCls}__link`}>
                {item.text}
              </a>
              {expanded && (
                <ul className={`${lCls}__subitems`}>
                  {item.items.map((sub, j) => {
                    const subActive = hash !== null && isActive(sub.href);
                    return (
                      <li
                        key={j}
                        className={`${lCls}__item${subActive ? ` ${lCls}__item--active` : ''}`}
                      >
                        <a href={sub.href} className={`${lCls}__link`}>
                          {sub.text}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

