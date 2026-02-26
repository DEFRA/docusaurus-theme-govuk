import React, { useState, useCallback, useEffect, useMemo } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
// github-slugger is Docusaurus's own heading-anchor dependency.
// Importing it directly ensures our anchor derivation never drifts from
// the IDs Docusaurus writes into the built HTML.
import GithubSlugger from 'github-slugger';
// @generated module emitted by @easyops-cn/docusaurus-search-local at build time;
// contains the hashed URL of the search index JSON (e.g. "search-index-fa7ba571.json").
// eslint-disable-next-line import/no-unresolved
import { searchIndexUrl } from '@generated/@easyops-cn/docusaurus-search-local/default/generated-constants.js';

/**
 * Resolve the template URL emitted by easyops.
 * The URL contains a `{dir}` placeholder for the doc root / locale directory.
 * For a single-locale site with docsRouteBasePath '/' the dir is empty.
 */
function resolveSearchIndexUrl(template) {
  // Strip the {dir} token (single-locale / single-docs-plugin case).
  return template.replace('{dir}', '');
}

/**
 * Fetch the easyops-generated lunr document list.
 *
 * Document schema (all fields present depend on type):
 *   b,i,t,u         — page root:   t = page title, b = breadcrumbs (empty)
 *   h,i,p,t,u       — heading:     t = heading text, h = anchor hash, p = parent page id
 *   i,p,s,t,u       — paragraph:   t = body text,   s = section heading / page title
 *   h,i,p,s,t,u     — para+anchor: t = body text,   s = section heading, h = anchor hash
 */
async function fetchSearchDocs(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load search index: ${res.status}`);
  const data = await res.json();
  return Object.values(data).flatMap((bucket) => bucket?.documents ?? []);
}

/** Minimal HTML escaping for values injected via innerHTML in suggestion templates. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function SearchBarInner() {
  const history = useHistory();
  const indexUrl = useBaseUrl(resolveSearchIndexUrl(searchIndexUrl));
  const rootUrl   = useBaseUrl('');
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    fetchSearchDocs(indexUrl)
      .then(setDocs)
      .catch((err) => console.warn('[SearchBar] Could not load search index', err));
  }, [indexUrl]);

  // Build URL → page title lookup from page-root entries (those with `b` field).
  const pageByUrl = useMemo(() => {
    const map = new Map();
    for (const doc of docs) {
      if ('b' in doc) map.set(doc.u, doc.t);
    }
    return map;
  }, [docs]);

  // Derive the site root URL and its title directly from the index — the
  // page-root entry with the shortest URL is always the site home page.
  // This is more reliable than useBaseUrl('') which can return '' in some
  // rendering contexts, causing the root title to leak into context trails.
  const { rootPageUrl, rootPageTitle } = useMemo(() => {
    let shortest = null;
    for (const [url, title] of pageByUrl) {
      if (shortest === null || url.length < shortest.url.length) {
        shortest = { url, title };
      }
    }
    return { rootPageUrl: shortest?.url ?? rootUrl, rootPageTitle: shortest?.title ?? null };
  }, [pageByUrl, rootUrl]);

  /**
   * Walk the URL path upwards collecting ancestor page titles.
   * Stops at (and excludes) the site root so the home-page title is never shown.
   * e.g. "/interactive-map/api/button-definition"
   *   → "/interactive-map/api" → "API reference"
   *   → "/interactive-map"     → skipped (site root)
   */
  const getAncestorPages = useCallback(
    (docUrl, currentPageTitle) => {
      const ancestors = [];
      const normalizedRoot = rootPageUrl.replace(/\/$/, '');
      let url = docUrl.replace(/\/$/, '');
      while (url.lastIndexOf('/') > 0) {
        url = url.substring(0, url.lastIndexOf('/'));
        if (url === normalizedRoot || url + '/' === rootPageUrl) break;
        const title = pageByUrl.get(url) ?? pageByUrl.get(url + '/');
        if (title && title !== currentPageTitle) {
          ancestors.unshift(title);
        }
      }
      return ancestors;
    },
    [pageByUrl, rootPageUrl],
  );

  const source = useCallback(
    (query, populateResults) => {
      if (!query || query.length < 2) {
        populateResults([]);
        return;
      }
      const q = query.toLowerCase();
      // `s` = the heading/section label; `t` = body text (can be a full paragraph).
      // Match against headings only so body paragraphs don't pollute results.
      // Deduplicate by URL so each page appears at most once.
      const seen = new Set();
      const results = [];
      for (const doc of docs) {
        const label = doc.s ?? doc.t;
        if (!label?.toLowerCase().includes(q)) continue;
        if (seen.has(doc.u)) continue;
        seen.add(doc.u);
        const currentPage = pageByUrl.get(doc.u);
        const ancestors   = getAncestorPages(doc.u, currentPage);
        // Build a context trail: ancestor pages → current page.
        // Exclude the result label itself and the site root title (home page
        // title is uninformative — user already knows which site they're on).
        const contextParts = [
          ...ancestors,
          ...(currentPage &&
              currentPage !== label &&
              currentPage !== rootPageTitle
            ? [currentPage]
            : []),
        ];

        // Derive the anchor using github-slugger — the same library Docusaurus
        // uses when writing heading IDs into the built HTML, so they always match.
        // Page-root entries (have `b`) live at the page URL with no hash.
        // Heading/paragraph entries (have `h` field, even when empty) deep-link.
        const anchor = ('h' in doc && !('b' in doc))
          ? new GithubSlugger().slug(label)
          : null;

        results.push({
          ...doc,
          _label: label,
          _context: contextParts.length ? contextParts.join(' › ') : null,
          _url: anchor ? `${doc.u}#${anchor}` : doc.u,
        });
        if (results.length === 8) break;
      }
      populateResults(results);
    },
    [docs, pageByUrl, getAncestorPages, rootPageTitle],
  );

  const onConfirm = useCallback(
    (selected) => {
      if (selected?._url) {
        history.push(selected._url);
      }
    },
    [history],
  );

  const Autocomplete = require('accessible-autocomplete/react').default;

  return (
    <Autocomplete
      id="govuk-search"
      source={source}
      templates={{
        inputValue: (result) => (result ? result._label : ''),
        suggestion: (result) => {
          if (!result) return '';
          const title = escapeHtml(result._label);
          const context = result._context
            ? `<span class="app-search__context">${escapeHtml(result._context)}</span>`
            : '';
          return `<span class="app-search__title">${title}</span>${context}`;
        },
      }}
      displayMenu="overlay"
      minLength={2}
      placeholder="Search"
      onConfirm={onConfirm}
      tNoResults={() => 'No results found'}
      tAssistiveHint={() =>
        'When autocomplete results are available use up and down arrows to review and enter to select.'
      }
    />
  );
}

/**
 * SearchBar rendered inside the GOV.UK header.
 * BrowserOnly ensures accessible-autocomplete (which uses DOM APIs) is never
 * evaluated during server-side generation.
 */
export default function SearchBar() {
  return <BrowserOnly>{() => <SearchBarInner />}</BrowserOnly>;
}
