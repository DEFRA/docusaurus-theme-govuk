import React from 'react';
import renderRoutes from '@docusaurus/renderRoutes';

export default function DocsRoot({route}) {
  return renderRoutes(route.routes);
}
