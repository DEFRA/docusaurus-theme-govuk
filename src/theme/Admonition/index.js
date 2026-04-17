import React from 'react';
import {InsetText, WarningText} from '@not-govuk/simple-components';

const ADMONITION_CONFIGS = {
  note:      { label: 'Note',      modifier: 'govuk-inset-text--note'     },
  tip:       { label: 'Tip',       modifier: 'govuk-inset-text--tip'      },
  info:      { label: 'Info',      modifier: 'govuk-inset-text--info'     },
  important: { label: 'Important', modifier: 'govuk-inset-text--important' },
  caution:   { label: 'Caution',   modifier: 'govuk-inset-text--caution'  },
  warning:   { label: 'Warning',   modifier: null },
  danger:    { label: 'Danger',    modifier: null },
};

export default function Admonition({type = 'note', title, children}) {
  const config = ADMONITION_CONFIGS[type] ?? ADMONITION_CONFIGS.note;
  const displayTitle = (title || config.label).toUpperCase();

  if (!config.modifier) {
    return <WarningText>{children}</WarningText>;
  }

  return (
    <InsetText className={config.modifier}>
      <p><strong>{displayTitle}</strong></p>
      {children}
    </InsetText>
  );
}
