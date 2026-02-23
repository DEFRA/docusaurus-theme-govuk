import React from 'react';
import {useDoc} from '../docContext';
import MDXContent from '@theme/MDXContent';

// Render a synthetic title if needed
function useSyntheticTitle() {
  const {metadata, frontMatter, contentTitle} = useDoc();
  const shouldRender =
    !frontMatter.hide_title && typeof contentTitle === 'undefined';
  if (!shouldRender) {
    return null;
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
