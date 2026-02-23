import React from 'react';
import Head from '@docusaurus/Head';
import {useDoc} from '../docContext';

export default function DocItemMetadata() {
  const {metadata} = useDoc();
  const {title, description} = metadata;

  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
    </Head>
  );
}
