import React from 'react';
import {DocProvider} from './docContext';
import DocItemMetadata from '@theme/DocItem/Metadata';
import DocItemLayout from '@theme/DocItem/Layout';

/**
 * DocItem — wraps a single doc page.
 * Uses our own DocProvider (not the version-specific one from
 * @docusaurus/plugin-content-docs/client which requires 3.5+).
 */
export default function DocItem(props) {
  const {content: Content} = props;

  return (
    <DocProvider content={Content}>
      <DocItemMetadata />
      <DocItemLayout>
        <Content />
      </DocItemLayout>
    </DocProvider>
  );
}
