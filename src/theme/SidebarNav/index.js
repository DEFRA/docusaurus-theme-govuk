import React, { useState, useEffect } from 'react';

/**
 * Hash-aware sidebar navigation for anchor-based (auto-generated) sidebars.
 *
 * SSR / no-JS: all groups are rendered expanded so content is accessible.
 * CSR after hydration: exactly one group expands based on the URL hash.
 *   - hash matches the group's h2 anchor → that group expands
 *   - hash matches any child's anchor → that group expands
 *   - no hash → all groups collapse
 *
 * State sentinel:
 *   null  = not yet hydrated (SSR or before first useEffect) → expand all
 *   ''    = JS loaded, no hash → collapse all
 *   str   = JS loaded, hash present → expand matching group only
 */
export default function SidebarNav({ items }) {
  const [hash, setHash] = useState(null);

  useEffect(() => {
    const update = () => setHash(window.location.hash.slice(1));
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  const cls = 'not-govuk-navigation-menu';
  const lCls = `${cls}__list`;

  return (
    <nav className={cls}>
      <ul className={lCls}>
        {items.map((item, i) => {
          const anchor = item.href ? (item.href.split('#')[1] ?? '') : '';
          const hasChildren = Array.isArray(item.items) && item.items.length > 0;
          const childAnchors = hasChildren
            ? item.items.map(sub => sub.href ? (sub.href.split('#')[1] ?? '') : '')
            : [];

          // null  → not yet hydrated, expand everything
          // ''    → no hash, collapse everything
          // value → expand if hash is this group's h2 anchor or any child anchor
          const hashMatchesGroup =
            hash !== '' && (
              hash === anchor ||
              childAnchors.includes(hash)
            );

          const expanded = hasChildren && (hash === null || hashMatchesGroup);
          const active = hash !== null && hashMatchesGroup;

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
                    const subAnchor = sub.href ? (sub.href.split('#')[1] ?? '') : '';
                    const subActive = hash !== null && hash === subAnchor;
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
