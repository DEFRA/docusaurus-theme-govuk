import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function NotFoundContent() {
  const homeUrl = useBaseUrl('/');

  return (
    <div className="app-prose-scope">
      <h1 className="govuk-heading-xl">Page not found</h1>
      <p className="govuk-body">
        If you typed the web address, check it is correct.
      </p>
      <p className="govuk-body">
        If you pasted the web address, check you copied the entire address.
      </p>
      <p className="govuk-body">
        <a href={homeUrl} className="govuk-link">
          Go to the homepage
        </a>
      </p>
    </div>
  );
}
