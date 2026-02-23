import React from 'react';
import renderRoutes from '@docusaurus/renderRoutes';

export default function DocVersionRoot({route}) {
  return renderRoutes(route.routes);
}
