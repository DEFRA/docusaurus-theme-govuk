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
  // GOV.UK table styling
  table: (props) => <table className="govuk-table" {...props} />,
  thead: (props) => <thead className="govuk-table__head" {...props} />,
  tbody: (props) => <tbody className="govuk-table__body" {...props} />,
  tr: (props) => <tr className="govuk-table__row" {...props} />,
  th: (props) => <th className="govuk-table__header" {...props} />,
  td: (props) => <td className="govuk-table__cell" {...props} />,
  // Blockquotes rendered as GOV.UK InsetText
  blockquote: ({children, ...rest}) => <InsetText {...rest}>{children}</InsetText>,
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
