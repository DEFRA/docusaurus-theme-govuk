import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

/**
 * Hash- and pathname-aware sidebar navigation.
 *
 * Desktop: section headings (items with children) are rendered as plain text,
 * all groups are permanently expanded, only sub-items are links.
 *
 * Mobile: section headings become toggle buttons; groups collapse and expand.
 * Active groups start expanded. Items without children are always links.
 *
 * SSR / no-JS: renders in desktop mode (all groups expanded) so content is
 * accessible without JavaScript.
 */
export default function SidebarNav({ items }) {
  const [hash, setHash] = useState(null);
  // null = not yet hydrated; false = desktop; true = mobile
  const [isMobile, setIsMobile] = useState(null);
  const [openGroups, setOpenGroups] = useState(new Set());
  const location = useLocation();

  useEffect(() => {
    const update = () => setHash(globalThis.location.hash.slice(1));
    update();
    globalThis.addEventListener('hashchange', update);
    return () => globalThis.removeEventListener('hashchange', update);
  }, []);

  useEffect(() => {
    const mql = globalThis.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  function parseHref(href) {
    if (!href) return { path: '', anchor: '' };
    const idx = href.indexOf('#');
    if (idx === -1) return { path: href, anchor: '' };
    return { path: href.slice(0, idx) || '/', anchor: href.slice(idx + 1) };
  }

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

  // When switching to mobile, open any groups that contain the active page.
  useEffect(() => {
    if (!isMobile || hash === null) return;
    const active = new Set();
    (items || []).forEach((item, i) => {
      if (!Array.isArray(item.items) || !item.items.length) return;
      if (isActive(item.href) || item.items.some(sub => isActive(sub.href))) {
        active.add(i);
      }
    });
    setOpenGroups(active);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, location.pathname, hash]);

  function toggleGroup(i) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const cls = 'not-govuk-navigation-menu';
  const lCls = `${cls}__list`;
  const itemCls = `${lCls}__item`;
  const activeCls = `${itemCls}--active`;

  function renderHeading(item, i, sublistId) {
    if (isMobile) {
      return (
        <button
          type="button"
          className={`${lCls}__heading-toggle`}
          aria-expanded={openGroups.has(i)}
          aria-controls={sublistId}
          onClick={() => toggleGroup(i)}
        >
          {item.text}
        </button>
      );
    }
    return <span className={`${lCls}__heading`}>{item.text}</span>;
  }

  return (
    <nav className={cls}>
      <ul className={lCls}>
        {(items || []).map((item, i) => {
          const hasChildren = Array.isArray(item.items) && item.items.length > 0;
          const active = hash !== null && isActive(item.href);
          const showChildren =
            hasChildren && (isMobile === null || !isMobile || openGroups.has(i));
          const liCls = active && !hasChildren ? `${itemCls} ${activeCls}` : itemCls;
          const sublistId = hasChildren ? `sidebar-group-${i}` : undefined;

          return (
            <li key={item.href || item.text} className={liCls}>
              {hasChildren ? renderHeading(item, i, sublistId) : (
                <a href={item.href} className={`${lCls}__link`}>{item.text}</a>
              )}
              {showChildren && (
                <ul id={sublistId} className={`${lCls}__subitems`}>
                  {item.items.map((sub) => {
                    const subActive = hash !== null && isActive(sub.href);
                    const subCls = subActive ? `${itemCls} ${activeCls}` : itemCls;
                    return (
                      <li key={sub.href || sub.text} className={subCls}>
                        <a href={sub.href} className={`${lCls}__link`}>{sub.text}</a>
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
