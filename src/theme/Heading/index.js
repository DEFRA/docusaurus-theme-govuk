import React from 'react';

const headingClasses = {
  h1: 'govuk-heading-xl',
  h2: 'govuk-heading-l',
  h3: 'govuk-heading-m',
  h4: 'govuk-heading-s',
  h5: 'govuk-heading-s',
  h6: 'govuk-heading-s',
};

export default function Heading({as: Tag = 'h2', id, children, ...props}) {
  const className = headingClasses[Tag] || 'govuk-heading-m';

  return (
    <Tag id={id} className={className} {...props}>
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="govuk-link app-heading-anchor"
          aria-label={`Direct link to ${typeof children === 'string' ? children : 'heading'}`}
        >
          #
        </a>
      )}
    </Tag>
  );
}
