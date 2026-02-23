import React from 'react';
import {useDoc} from '../docContext';

export default function DocItemPaginator() {
  const {metadata} = useDoc();
  const {previous, next} = metadata;

  if (!previous && !next) {
    return null;
  }

  return (
    <nav className="app-pagination govuk-!-margin-top-8" aria-label="Pagination">
      <div className="app-pagination__container">
        {previous ? (
          <div className="app-pagination__prev">
            <span className="govuk-body-s app-text-secondary">Previous</span>
            <br />
            <a href={previous.permalink} className="govuk-link">
              {previous.title}
            </a>
          </div>
        ) : <div />}
        {next ? (
          <div className="app-pagination__next">
            <span className="govuk-body-s app-text-secondary">Next</span>
            <br />
            <a href={next.permalink} className="govuk-link">
              {next.title}
            </a>
          </div>
        ) : <div />}
      </div>
    </nav>
  );
}
