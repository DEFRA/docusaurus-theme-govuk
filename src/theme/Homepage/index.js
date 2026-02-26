import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

// Homepage component for consumer sites that use a custom page (src/pages/index.js)
// rather than a docs-based root. The masthead is rendered automatically by Layout
// when the current path is '/' and themeConfig.govuk.homepage is configured.
export default function Homepage() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      {/* Masthead is injected by Layout on the root path. This is because we need to adjust the styling for the header/nav, so it must live in the global Layout. */}
    </Layout>
  );
}
