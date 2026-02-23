import React from 'react';
import DocItemContent from '@theme/DocItem/Content';

export default function DocItemLayout({children}) {
  return (
    <article className="app-prose-scope">
      <DocItemContent>{children}</DocItemContent>
    </article>
  );
}
