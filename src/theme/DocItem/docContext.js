import React, {createContext, useContext} from 'react';

const DocContext = createContext(null);

/**
 * Lightweight DocProvider that works across Docusaurus 3.x versions.
 * Replaces the version-specific DocProvider from @docusaurus/plugin-content-docs/client
 * which was only added in Docusaurus 3.5+.
 */
export function DocProvider({content, children}) {
  const Content = content;
  const value = {
    content: Content,
    metadata: Content.metadata || {},
    frontMatter: Content.frontMatter || {},
    contentTitle: Content.contentTitle,
    assets: Content.assets || {},
  };

  return (
    <DocContext.Provider value={value}>
      {children}
    </DocContext.Provider>
  );
}

/**
 * Hook to access doc data from DocProvider context.
 * Replaces the version-specific useDoc() from @docusaurus/plugin-content-docs/client.
 */
export function useDoc() {
  const ctx = useContext(DocContext);
  if (!ctx) {
    throw new Error('useDoc() must be used within a <DocProvider>');
  }
  return ctx;
}
