import React from 'react';
import renderRoutes from '@docusaurus/renderRoutes';
import DocRootLayout from '@theme/DocRoot/Layout';

/**
 * DocRoot — version-independent wrapper for the doc routes.
 * Does not depend on useDocRootMetadata/DocsSidebarProvider
 * which are only available in Docusaurus 3.5+.
 * Instead, it renders the matched child routes directly,
 * wrapped in the DocRootLayout (which includes the GOV.UK shell).
 */
export default function DocRoot({route}) {
  return (
    <DocRootLayout>
      {renderRoutes(route.routes)}
    </DocRootLayout>
  );
}
