import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';
import Admonition from '@theme/Admonition';
import {InsetText} from '@not-govuk/simple-components';

function GovukLink(props) {
  return <a className="govuk-link" {...props} />;
}

const MDXComponents = {
  // Inline code only; block code is handled by the pre handler
  code: (props) => <code {...props} />,
  pre: (props) => {
    // MDX wraps fenced code blocks in <pre><code className="language-x">.
    // Extract the inner code element props and render as CodeBlock.
    const {children} = props;
    if (React.isValidElement(children)) {
      return <CodeBlock {...children.props} />;
    }
    return <pre {...props} />;
  },
  // Paragraphs: detect API definition patterns like **Type:** `string` and render as <dl>
  p: ({children, ...rest}) => {
    const childArray = React.Children.toArray(children);
    const firstChild = childArray[0];

    // A definition-list paragraph starts with a <strong> whose text ends with ':'
    const isDefinitionTerm = (node) =>
      React.isValidElement(node) &&
      node.type === 'strong' &&
      typeof node.props.children === 'string' &&
      node.props.children.trim().endsWith(':');

    if (!isDefinitionTerm(firstChild)) {
      return <p {...rest}>{children}</p>;
    }

    // Group children into [{term, defs}] pairs split on each <strong> label
    const items = [];
    let current = null;
    for (const child of childArray) {
      if (isDefinitionTerm(child)) {
        if (current) items.push(current);
        current = {term: child.props.children, defs: []};
      } else if (current) {
        // Skip bare whitespace/newline separators between term and value
        if (typeof child === 'string' && child.trim() === '') continue;
        current.defs.push(child);
      }
    }
    if (current) items.push(current);

    // Render <dd> content, converting any **Required** (or similar flags) to (required)
    const renderDefs = (defs) => defs.map((node) => {
      if (
        React.isValidElement(node) &&
        node.type === 'strong' &&
        typeof node.props.children === 'string'
      ) {
        const label = node.props.children.trim().toLowerCase();
        return <strong key={label}> ({label})</strong>;
      }
      return node;
    });

    return (
      <dl className="app-definition-list">
        {items.map((item) => (
          <div key={item.term} className="app-definition-list__item">
            <dt>{item.term}</dt>
            <dd>{renderDefs(item.defs)}</dd>
          </div>
        ))}
      </dl>
    );
  },
  // GOV.UK table styling
  table: (props) => <table className="govuk-table" {...props} />,
  thead: (props) => <thead className="govuk-table__head" {...props} />,
  tbody: (props) => <tbody className="govuk-table__body" {...props} />,
  tr: (props) => <tr className="govuk-table__row" {...props} />,
  th: (props) => <th className="govuk-table__header" {...props} />,
  td: (props) => <td className="govuk-table__cell" {...props} />,
  // Blockquotes rendered as GOV.UK InsetText, with support for GitHub-style alerts
  // e.g. > [!NOTE], > [!WARNING], > [!TIP], > [!IMPORTANT], > [!CAUTION]
  blockquote: ({children, ...rest}) => {
    // Use \s* to tolerate any whitespace (newlines, \r\n, spaces) around the marker
    const alertPattern = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;
    const childArray = React.Children.toArray(children);
    // Skip leading whitespace text nodes — MDX can inject them
    const firstChildIndex = childArray.findIndex((c) => React.isValidElement(c));
    const firstChild = childArray[firstChildIndex];

    // Don't check type === 'p': when a p override is registered in MDXComponents,
    // MDX sets the element type to the override function, not the string 'p'.
    if (firstChild?.props) {
      const pChildren = React.Children.toArray(firstChild.props.children);

      // Remark can split "[!NOTE]" across adjacent text nodes (e.g. "[" + "!NOTE]\n...")
      // when the paragraph also contains inline links. Merge leading text nodes before
      // testing so the marker is always visible as a single string.
      let mergedLeadingText = '';
      let mergeCount = 0;
      for (const child of pChildren) {
        if (typeof child !== 'string') break;
        mergedLeadingText += child;
        mergeCount += 1;
      }

      const match = alertPattern.exec(mergedLeadingText);
      if (match) {
        const alertType = match[1].toUpperCase();
        const remainingText = mergedLeadingText.slice(match[0].length).trimStart();
        const newPChildren = [
          ...(remainingText ? [remainingText] : []),
          ...pChildren.slice(mergeCount),
        ].filter((c) => !(typeof c === 'string' && c.trim() === ''));

        const contentParagraph = newPChildren.length > 0
          ? React.cloneElement(firstChild, {key: 'content'}, ...newPChildren)
          : null;
        // Use firstChildIndex + 1 so we don't re-include the original <p>
        const allContent = [contentParagraph, ...childArray.slice(firstChildIndex + 1)].filter(Boolean);

        return (
          <InsetText {...rest}>
            <p key="title"><strong>{alertType}</strong></p>
            {allContent}
          </InsetText>
        );
      }
    }

    return <InsetText {...rest}>{children}</InsetText>;
  },
  h1: (props) => <Heading as="h1" {...props} />,
  h2: (props) => <Heading as="h2" {...props} />,
  h3: (props) => <Heading as="h3" {...props} />,
  h4: (props) => <Heading as="h4" {...props} />,
  h5: (props) => <Heading as="h5" {...props} />,
  h6: (props) => <Heading as="h6" {...props} />,
  a: GovukLink,
  admonition: Admonition,
};

export default MDXComponents;
