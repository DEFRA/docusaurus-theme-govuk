import React from 'react';
import {useDoc} from '../docContext';
import MDXContent from '@theme/MDXContent';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// Render a synthetic title if needed
function useSyntheticTitle() {
  const {metadata, frontMatter, contentTitle} = useDoc();
  const {siteConfig} = useDocusaurusContext();
  const shouldRender =
    !frontMatter.hide_title &&
    typeof contentTitle === 'undefined' &&
    metadata.slug !== '/';
  if (!shouldRender) {
    return null;
  }
  // For the root index page, use the Docusaurus site title instead of the filename
  if (metadata.title?.toLowerCase() === 'index') {
    return siteConfig.title;
  }
  return metadata.title;
}

export default function DocItemContent({children}) {
  const syntheticTitle = useSyntheticTitle();
  return (
    <>
      {syntheticTitle && (
        <header>
          <h1 className="govuk-heading-xl">{syntheticTitle}</h1>
        </header>
      )}
      <MDXContent>{children}</MDXContent>
    </>
  );
}
