# docusaurus-theme-govuk

A Docusaurus 3 theme that applies the [GOV.UK Design System](https://design-system.service.gov.uk/) to your documentation site.

## Features

- Full GOV.UK Design System shell: Header (with crown crest), Service Navigation, Phase Banner, Footer
- GOV.UK typography applied to all Markdown/MDX content via prose scoping
- Sidebar navigation driven by configuration (not Docusaurus's built-in sidebar UI)
- Syntax-highlighted code blocks with copy button
- Admonition blocks (:::note, :::warning, etc.) rendered as GOV.UK InsetText / WarningText
- 404 page with GOV.UK styling
- Bundled GDS Transport fonts and GOV.UK static assets
- Compatible with React 18 and React 19

## Installation

```bash
npm install docusaurus-theme-govuk
```

## Configuration

Update your `docusaurus.config.js` (or `.cjs`):

```js
module.exports = {
  title: 'My Service',
  tagline: 'Service documentation',
  url: 'https://example.gov.uk',
  baseUrl: '/',

  // Remove presets — the theme replaces preset-classic
  presets: [],

  // Register the GOV.UK theme
  themes: ['docusaurus-theme-govuk'],

  // Use plugin-content-docs directly for Markdown processing
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        routeBasePath: '/',
        sidebarPath: require.resolve('./sidebars.js'),
      },
    ],
  ],

  // GOV.UK theme configuration
  themeConfig: {
    govuk: {
      header: {
        serviceName: 'My Service',
        serviceHref: '/',
      },

      navigation: [
        {
          text: 'Documentation',
          href: '/',
          sidebar: [
            { text: 'Introduction', href: '/' },
            { text: 'Getting Started', href: '/getting-started' },
            {
              text: 'API Reference',
              href: '/api',
              items: [
                { text: 'Methods', href: '/methods' },
                { text: 'Events', href: '/events' },
              ],
            },
          ],
        },
      ],

      phaseBanner: {
        phase: 'alpha',
        text: 'This is a new service – your feedback will help us to improve it.',
        feedbackHref: '/feedback',
      },

      footer: {
        meta: [
          { text: 'GitHub', href: 'https://github.com/your-org/your-repo' },
        ],
      },
    },
  },
};
```

### Configuration Reference

#### `themeConfig.govuk.header`

| Property | Type | Description |
|----------|------|-------------|
| `serviceName` | `string` | Service name displayed in the GOV.UK header |
| `serviceHref` | `string` | Link for the service name (default: `/`) |

#### `themeConfig.govuk.navigation`

Array of top-level navigation items. Each item appears in the Service Navigation bar.

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | Navigation link text |
| `href` | `string` | Base path for this section |
| `sidebar` | `array` | Optional sidebar items for this section |

Each `sidebar` item:

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | Sidebar link text |
| `href` | `string` | Path relative to the parent navigation `href` |
| `items` | `array` | Optional nested sidebar items (one level of nesting) |

#### `themeConfig.govuk.phaseBanner`

| Property | Type | Description |
|----------|------|-------------|
| `phase` | `string` | Phase tag text (e.g. `'alpha'`, `'beta'`) |
| `text` | `string` | Banner body text (plain text, rendered as React children) |
| `feedbackHref` | `string` | Optional URL for a feedback link appended after the text |

#### `themeConfig.govuk.footer`

| Property | Type | Description |
|----------|------|-------------|
| `meta` | `array` | Array of `{ text, href }` objects rendered as footer meta links |

## Sidebar Configuration

The sidebar is configured through `themeConfig.govuk.navigation[].sidebar`, **not** through Docusaurus's built-in sidebar system. The Docusaurus `sidebars.js` file is still used by `plugin-content-docs` for route generation and doc ordering, but the visual sidebar is rendered by the GOV.UK theme.

The sidebar supports up to 3 levels:
1. **Level 1**: Service Navigation (top bar)
2. **Level 2**: Sidebar items
3. **Level 3**: Nested sidebar items (collapsible groups)

## Overriding Components

You can override any theme component by creating a file at the same path in your project's `src/theme/` directory. For example, to override the 404 page:

```
src/theme/NotFound/Content/index.js
```

Common components to override:
- `Layout` — the full page shell
- `NotFound/Content` — 404 page content
- `Homepage` — the default landing page
- `CodeBlock` — code block rendering
- `Heading` — heading elements
- `Admonition` — callout blocks

## Compatibility

- **Docusaurus**: ^3.0.0
- **React**: ^18.0.0 || ^19.0.0
- **Node.js**: 18+