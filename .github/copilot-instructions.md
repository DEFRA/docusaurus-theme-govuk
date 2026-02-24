# GitHub Copilot Instructions

## GOV.UK Components

When working with GOV.UK Design System components in this project, always import from `@not-govuk/simple-components`:

```javascript
import { Button, Tag, InsetText, WarningText, Details } from '@not-govuk/simple-components';
```

### Available Components

Common components available from `@not-govuk/simple-components`:
- `Button` - GOV.UK buttons (default, start, secondary)
- `Tag` - Status tags and phase banners
- `InsetText` - Highlighted information blocks
- `WarningText` - Important warnings
- `Details` - Expandable content sections
- `Header` - GOV.UK header with crown logo
- `Footer` - GOV.UK footer
- `ServiceNavigation` - Navigation menu
- `PhaseBanner` - Alpha/Beta phase banners
- `SkipLink` - Accessibility skip links
- `NavigationMenu` - Sidebar navigation menus

### Example Usage

```javascript
import React from 'react';
import { Button, Tag, InsetText } from '@not-govuk/simple-components';
import Layout from '@theme/Layout';

export default function MyPage() {
  return (
    <Layout title="My Page">
      <h1 className="govuk-heading-xl">My Page Title</h1>
      
      <p className="govuk-body-l">
        Lead paragraph with larger text.
      </p>
      
      <InsetText>
        Important information that stands out.
      </InsetText>
      
      <div className="govuk-button-group">
        <Button>Save and continue</Button>
        <Button secondary>Cancel</Button>
      </div>
      
      <Tag className="govuk-tag--blue">Beta</Tag>
    </Layout>
  );
}
```

### Styling Guidelines

Always use GOV.UK Design System CSS classes:
- Headings: `govuk-heading-xl`, `govuk-heading-l`, `govuk-heading-m`, `govuk-heading-s`
- Body text: `govuk-body`, `govuk-body-l`, `govuk-body-s`
- Lists: `govuk-list`, `govuk-list--bullet`, `govuk-list--number`
- Links: `govuk-link`
- Spacing: `govuk-!-margin-top-8`, `govuk-!-margin-bottom-4`, etc.
- Grid: `govuk-grid-row`, `govuk-grid-column-two-thirds`, `govuk-grid-column-one-third`

### Page Structure

All pages use the standard Layout component. The sidebar is automatically shown based on the route configuration in `govuk.config.js`:

```javascript
import React from 'react';
import Layout from '@theme/Layout';

export default function MyPage() {
  return (
    <Layout title="Page Title" description="Page description">
      <h1 className="govuk-heading-xl">Page Title</h1>
      {/* Content */}
    </Layout>
  );
}
```

### Navigation & Sidebar Configuration

Navigation is configured in `govuk.config.js` with a 3-level structure:
- **Level 1**: Service Navigation (top nav bar)
- **Level 2**: Sidebar items (for custom pages only)
- **Level 3**: Nested sidebar items (collapsible groups)

**Note**: Documentation pages (`/docs/*.md`) use the sidebar defined in `govuk.config.js`, not Docusaurus's built-in sidebar. The sidebar is driven entirely by the configuration file.

```javascript
// govuk.config.js
{
  navigation: [
    {
      text: 'Documentation',
      href: '/',
    },
    {
      text: 'Examples',
      href: '/examples',
      sidebar: [  // Custom sidebar for /examples pages
        {
          text: 'Overview',
          href: '/',
        },
        {
          text: 'Components',
          href: '/components',
          items: [  // Level 3 - nested in sidebar
            { text: 'Buttons', href: '/buttons' },
            { text: 'Forms', href: '/forms' },
          ],
        },
      ],
    },
  ],
}
```

The Layout component automatically displays the sidebar when on a route that matches a navigation section with a `sidebar` property.

### Documentation Pages

For Markdown documentation in `/docs`, use:
```markdown
---
sidebar_position: 1
---

# Page Title

Content with GOV.UK styling applied automatically.
```

### Routing

- Documentation pages: `/docs/*.md` → routes based on file structure
- Custom pages: `/src/pages/*.js` → routes based on file name
- Nested routes: `/src/pages/examples/buttons.js` → `/examples/buttons`
