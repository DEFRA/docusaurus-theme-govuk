import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

export default function Homepage() {
  const {siteConfig} = useDocusaurusContext();
  const baseUrl = useBaseUrl('/');

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl govuk-!-margin-top-8">
            {siteConfig.title}
          </h1>

          {siteConfig.tagline && (
            <p className="govuk-body-l">
              {siteConfig.tagline}
            </p>
          )}

          <a
            href={baseUrl}
            role="button"
            draggable="false"
            className="govuk-button govuk-button--start govuk-!-margin-top-4"
          >
            Get started
            <svg
              className="govuk-button__start-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="17.5"
              height="19"
              viewBox="0 0 33 40"
              aria-hidden="true"
              focusable="false"
            >
              <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
            </svg>
          </a>
        </div>
      </div>
    </Layout>
  );
}
