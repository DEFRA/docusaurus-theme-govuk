import React from 'react';
import '../../css/theme.scss';
import {SkipLink, Header, Footer, PhaseBanner, ServiceNavigation, NavigationMenu} from '@not-govuk/simple-components';
import SidebarNav from '../SidebarNav';
import {useLocation} from '@docusaurus/router';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import LayoutProvider from '@theme/Layout/Provider';
import AnnouncementBar from '@theme/AnnouncementBar';

// Read GOV.UK config from themeConfig
function useGovukConfig() {
  const {siteConfig} = useDocusaurusContext();
  return siteConfig.themeConfig?.govuk || {};
}

// Strip the Docusaurus baseUrl prefix from a pathname
function stripBaseUrl(pathname, baseUrl) {
  if (baseUrl === '/') return pathname;
  const prefix = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  if (pathname.startsWith(prefix)) {
    const stripped = pathname.slice(prefix.length);
    return stripped || '/';
  }
  return pathname;
}

// Resolve sidebar paths.
// Paths starting with '/' are absolute (from site root).
// Paths without '/' are relative to the section's basePath.
function resolvePath(basePath, relativePath) {
  // Absolute path — return as-is
  if (relativePath.startsWith('/')) return relativePath;
  // Relative to root
  if (basePath === '/') return `/${relativePath}`;
  // Relative to section
  const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  return `${cleanBase}/${relativePath}`;
}

// Return the effective sidebar descriptor for a navigation section.
// Auto-generated sidebars are { _auto: true, items: [...] } (a plain object
// that survives JSON serialisation, unlike array non-index properties).
// Manual sidebars remain plain arrays and are wrapped here for uniform access.
function getEffectiveSidebar(section) {
  const s = section.sidebar;
  if (s && typeof s === 'object' && !Array.isArray(s) && s._auto === true) {
    return s; // { _auto: true, items: [...] }
  }
  if (Array.isArray(s)) {
    return { _auto: false, items: s };
  }
  return null;
}

// Resolve all paths in sidebar items
function resolveSidebarPaths(items, basePath) {
  return items.map(item => {
    const resolvedItem = {
      ...item,
      href: resolvePath(basePath, item.href),
    };
    if (item.items && item.items.length > 0) {
      resolvedItem.items = item.items.map(nestedItem => ({
        ...nestedItem,
        href: resolvePath(resolvedItem.href, nestedItem.href),
      }));
    }
    return resolvedItem;
  });
}

// Find the active navigation section based on current path.
function getActiveSection(pathname, navigation) {
  return navigation.find(section => {
    const sidebar = getEffectiveSidebar(section);
    if (!sidebar) return false;
    // First: check if current pathname matches the section's own base page or
    // any sub-page. This handles auto-generated sidebars whose item hrefs
    // include anchors (#...) and would never match a plain pathname.
    const sectionPath = section.href || '/';
    if (pathname === sectionPath || pathname.startsWith(sectionPath + '/')) {
      return true;
    }
    // Fallback: match by exact item href (for array sidebars with sub-pages
    // whose hrefs differ from the section's base href).
    const resolvedSidebar = resolveSidebarPaths(sidebar.items, sectionPath);
    return resolvedSidebar.some(item => {
      if (pathname === item.href) return true;
      if (item.items) {
        return item.items.some(nestedItem => pathname === nestedItem.href);
      }
      return false;
    });
  });
}

export default function Layout(props) {
  const location = useLocation();
  const {siteConfig} = useDocusaurusContext();
  const govukConfig = siteConfig.themeConfig?.govuk || {};
  const {
    children,
    title,
    description,
    noFooter,
  } = props;

  const navigation = govukConfig.navigation || [];
  const header = govukConfig.header || {};
  const phaseBanner = govukConfig.phaseBanner;
  const footer = govukConfig.footer || {};

  // Strip baseUrl so sidebar matching works regardless of deployment path
  const pathname = stripBaseUrl(location.pathname, siteConfig.baseUrl);
  const baseUrl = siteConfig.baseUrl.endsWith('/')
    ? siteConfig.baseUrl.slice(0, -1)
    : siteConfig.baseUrl;

  // Prepend baseUrl to a site-root path for use in actual links
  function withBase(href) {
    if (!href || href.startsWith('http')) return href;
    return `${baseUrl}${href.startsWith('/') ? href : `/${href}`}`;
  }

  // Build-time auto-generated sidebars were resolved into the navigation
  // array directly (sidebar: 'auto' replaced with sidebar: [...]) so we
  // just read the array from siteConfig as normal.

  // Get active section for sidebar
  const activeSection = getActiveSection(pathname, navigation);
  const basePath = activeSection?.href || '/';
  const effectiveSidebar = activeSection ? getEffectiveSidebar(activeSection) : null;
  const sidebarItems = effectiveSidebar
    ? resolveSidebarPaths(effectiveSidebar.items, basePath).map(item => ({
        ...item,
        href: withBase(item.href),
        ...(item.items && {
          items: item.items.map(nested => ({...nested, href: withBase(nested.href)})),
        }),
      }))
    : null;

  // Anchor-based sidebars (auto-generated) use a hash-aware component.
  // Page-based sidebars (manually configured arrays) use NavigationMenu which
  // uses React Router's active detection for sub-page expansion.
  const isAnchorSidebar = effectiveSidebar?._auto === true;

  // Convert navigation to service navigation format (Level 1 only)
  const serviceNavItems = navigation.map(item => ({
    href: withBase(item.href),
    text: item.text,
  }));

  return (
    <LayoutProvider>
      <Head>
        <html lang="en-GB" className="govuk-template" />
        <body className="govuk-template__body" />
        <meta name="theme-color" content="#0b0c0c" />
        {title && <title>{title}</title>}
        {description && <meta name="description" content={description} />}
      </Head>

      <div className="govuk-template--rebranded">
        <AnnouncementBar />

        {/* Hidden navbar element for Docusaurus hooks */}
        <nav className="navbar" style={{display: 'none'}} />

        <SkipLink for="main-content">Skip to main content</SkipLink>

        <Header
          rebrand
          organisationText={header.organisationText}
          organisationHref={header.organisationHref}
        />

        <ServiceNavigation 
          items={serviceNavItems}
          serviceName={header.serviceName}
          serviceHref={withBase(header.serviceHref || '/')}
        />

        <div className="govuk-width-container">
          {phaseBanner && (
            <PhaseBanner phase={phaseBanner.phase}>
              {phaseBanner.text}{' '}
              {phaseBanner.feedbackHref && (
                <a href={phaseBanner.feedbackHref} className="govuk-link">
                  feedback
                </a>
              )}
            </PhaseBanner>
          )}

          <main id="main-content" className="govuk-main-wrapper">
            {sidebarItems ? (
              <div className="app-layout-sidebar">
                <aside className="app-layout-sidebar__nav">
                  {isAnchorSidebar
                    ? <SidebarNav items={sidebarItems} />
                    : <NavigationMenu items={sidebarItems} />}
                </aside>
                <div className="app-layout-sidebar__content">
                  {children}
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>

        {!noFooter && (
          <Footer rebrand meta={footer.meta} />
        )}
      </div>
    </LayoutProvider>
  );
}
