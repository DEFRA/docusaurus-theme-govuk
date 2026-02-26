import React from 'react';
import Head from '@docusaurus/Head';
import {useDoc} from '../docContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function DocItemMetadata() {
  const {metadata} = useDoc();
  const {siteConfig} = useDocusaurusContext();
  const {description} = metadata;
  // Use the Docusaurus site title for root index pages instead of the filename
  const title = metadata.title?.toLowerCase() === 'index'
    ? siteConfig.title
    : metadata.title;

  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
    </Head>
  );
}
