import React from 'react';
import {InsetText, WarningText} from '@not-govuk/simple-components';

const admonitionTitles = {
  note: 'Note',
  tip: 'Tip',
  info: 'Info',
  warning: 'Warning',
  danger: 'Danger',
  caution: 'Caution',
};

export default function Admonition({type = 'note', title, children}) {
  const displayTitle = title || admonitionTitles[type] || 'Note';

  // Warning and danger types use GOV.UK WarningText
  if (type === 'warning' || type === 'danger' || type === 'caution') {
    return (
      <WarningText>
        <strong>{displayTitle}: </strong>
        {children}
      </WarningText>
    );
  }

  // All other types use GOV.UK InsetText
  return (
    <InsetText>
      {title && <strong>{displayTitle}: </strong>}
      {children}
    </InsetText>
  );
}
