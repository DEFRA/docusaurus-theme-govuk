# docusaurus-theme-govuk

A Docusaurus 3 theme that applies the [GOV.UK Design System](https://design-system.service.gov.uk/) to your documentation site.

## Features

- Full GOV.UK Design System shell: Header (with crown crest), Service Navigation, Phase Banner, Footer
- GOV.UK typography applied to all Markdown/MDX content via prose scoping
- Sidebar navigation driven by configuration (not Docusaurus's built-in sidebar UI)
- Syntax-highlighted code blocks with copy button
- Admonition blocks (:::note, :::warning, etc.) rendered as GOV.UK InsetText / WarningText
- 404 page with GOV.UK styling
- GOV.UK static assets included (GDS Transport is **not** bundled — the theme uses Helvetica/Arial)
- Compatible with React 18 and React 19


## Installation

```bash
npm install docusaurus-theme-govuk
```

### Consumer responsibilities

- Install all required peer dependencies (see `peerDependencies` in the package).
- Use the theme in your Docusaurus config as shown below.
- Ensure your project uses compatible versions of Docusaurus and React.
- Configure navigation and sidebar via `themeConfig.govuk.navigation`.

No additional setup is required beyond standard Docusaurus theme usage.

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
        organisationText: 'My Organisation',
        organisationHref: 'https://example.gov.uk',
      },

      navigation: [
        {
          // Auto sidebar: headings from docs/index.md become sidebar items
          text: 'Documentation',
          href: '/',
          sidebar: 'auto',
        },
        {
          // Hardcoded sidebar: full control over labels, ordering, and nesting
          text: 'API Reference',
          href: '/api',
          sidebar: [
            { text: 'Introduction', href: '/api' },
            {
              text: 'Methods',
              href: '/api/methods',
              items: [
                { text: 'Initialise', href: '/api/methods#initialise' },
                { text: 'Destroy', href: '/api/methods#destroy' },
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
| `organisationText` | `string` | Organisation name displayed in the header crown block |
| `organisationHref` | `string` | URL the organisation name links to |

#### `themeConfig.govuk.navigation`

Array of top-level navigation items. Each item appears in the Service Navigation bar.

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | Navigation link text |
| `href` | `string` | Base path for this section |
| `sidebar` | `array \| 'auto'` | Optional. Sidebar items for this section, or `'auto'` to generate from headings (see [Sidebar Configuration](#sidebar-configuration)) |

When `sidebar` is an array, each item:

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | Sidebar link text |
| `href` | `string` | Path for this item (absolute, e.g. `/api/methods`) |
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

### Hardcoded sidebar

Pass an array to `sidebar` to define the structure explicitly. This gives full control over labels, ordering, and anchor links:

```js
sidebar: [
  { text: 'Overview', href: '/api' },
  {
    text: 'Constructor',
    href: '/api#constructor',
    items: [
      { text: 'Options', href: '/api#options' },
    ],
  },
]
```

Nested groups are collapsible. A group is expanded when the current URL hash matches either the group's own `href` anchor or any child anchor.

### Auto sidebar

Set `sidebar: 'auto'` on a navigation section to generate the sidebar automatically from the section's corresponding Markdown document at build time:

```js
{
  text: 'API Reference',
  href: '/api',
  sidebar: 'auto',
}
```

The theme reads `docs/<slug>.md` (or `.mdx`) where `<slug>` is derived from `href` (e.g. `href: '/api'` → `docs/api.md`). It parses the document's headings and builds the sidebar as follows:

- `##` (h2) headings become top-level sidebar items
- `###` (h3) headings become nested items under the preceding h2
- Heading text is stripped of Markdown syntax (bold, italic, inline code, links) to produce plain-text labels

The sidebar is resolved once at build time and serialised into the site configuration. No runtime file reads occur.

#### Limitations

- Only h2 and h3 headings are included; h4 and deeper are ignored.
- The document must be in the `docs/` directory at the root of your Docusaurus site.
- Heading IDs set via the `{#custom-id}` syntax are not yet respected — the generated anchor will use the slugified heading text.

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