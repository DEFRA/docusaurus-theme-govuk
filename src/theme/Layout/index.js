import React from 'react';
import '../../css/theme.scss';
import {SkipLink, Header, Footer, PhaseBanner, ServiceNavigation, NavigationMenu} from '@not-govuk/simple-components';
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

// Find the active navigation section based on current path
function getActiveSection(pathname, navigation) {
  return navigation.find(section => {
    if (!section.sidebar) return false;
    // Use the section's configured href as the base path
    const basePath = section.href || '/';
    const resolvedSidebar = resolveSidebarPaths(section.sidebar, basePath);
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

  // Get active section for sidebar
  const activeSection = getActiveSection(pathname, navigation);
  const basePath = activeSection?.href || '/';
  const sidebarItems = activeSection?.sidebar
    ? resolveSidebarPaths(activeSection.sidebar, basePath).map(item => ({
        ...item,
        href: withBase(item.href),
        ...(item.items && {
          items: item.items.map(nested => ({...nested, href: withBase(nested.href)})),
        }),
      }))
    : null;

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
                  <NavigationMenu items={sidebarItems} />
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
