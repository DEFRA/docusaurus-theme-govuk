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

      homepage: {
        // Path to link the "Get started" button on the homepage masthead
        getStartedHref: '/getting-started',
        // Short description rendered below the heading
        description: 'A short summary of what your service does.',
      },
    },
  },
};
```

### Configuration Reference

#### `themeConfig.govuk.homepage`

Controls the homepage masthead — a full-width blue banner rendered between the service navigation and the page body on the homepage only. The banner shares the GOV.UK rebrand blue (`#1d70b8`) with the header and service navigation, so all three elements appear as one unified block.

The masthead displays `siteConfig.tagline` as the heading and `homepage.description` as the lead paragraph. A GOV.UK "Start" button links to the configured `getStartedHref`.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `getStartedHref` | `string` | `'/getting-started'` | Path the "Get started" button links to |
| `description` | `string` | — | Short description rendered below the heading |

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

## Search

The theme includes a built-in search bar rendered in the header. It uses [`@easyops-cn/docusaurus-search-local`](https://github.com/easyops-cn/docusaurus-search-local) to generate a local [lunr](https://lunrjs.com/) index at build time, and [alphagov's `accessible-autocomplete`](https://github.com/alphagov/accessible-autocomplete) as the accessible suggestion UI. No external service or API key is required.

### Dependencies

Install both packages in your Docusaurus site:

```bash
npm install @easyops-cn/docusaurus-search-local accessible-autocomplete
```

### Configuration

The `@easyops-cn/docusaurus-search-local` theme must appear **before** `docusaurus-theme-govuk` in the `themes` array. This order ensures the search index is generated by the easyops plugin while the GOV.UK theme's `SearchBar` component wins the slot and controls the UI.

```js
themes: [
  [
    require.resolve('@easyops-cn/docusaurus-search-local'),
    {
      // Match your docs routeBasePath — '/' for docs-only mode
      docsRouteBasePath: '/',
      indexBlog: false,
      indexPages: false,
      // Hashed filenames allow long-term browser caching of the search index
      hashed: 'filename',
      highlightSearchTermsOnTargetPage: true,
      searchResultContextMaxLength: 60,
    },
  ],
  'docusaurus-theme-govuk',
],
```

You must also add `docs.versionPersistence` to `themeConfig`. Without it, the `@easyops-cn/docusaurus-search-local` plugin throws a runtime error during static site generation (`Cannot read properties of undefined (reading 'versionPersistence')`):

```js
themeConfig: {
  docs: {
    versionPersistence: 'localStorage',
  },
  // ...
},
```

### Search index coverage

By default, all content under `docsRouteBasePath` is indexed. Blog and custom pages are excluded in the example above (`indexBlog: false`, `indexPages: false`). Adjust these to match your site structure.

The search index is generated at build time. Run `npm run build` (or `docs:build`) before serving — the search bar will return no results in development mode (`docusaurus start`).

### Result links

The search bar deep-links directly to the matching heading within a page using anchor IDs derived from heading text, using the same slugifier as Docusaurus itself. Results show a breadcrumb context trail (`Page › Heading`) to help users identify where a match appears.

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

## Open Source Attribution

This theme includes a modified version of the [`@not-govuk/header`](https://github.com/daniel-ac-martin/NotGovUK/tree/master/packages/components/header) component from the [NotGovUK](https://github.com/daniel-ac-martin/NotGovUK) project.

The modification adds a `children` prop so that additional content (the search bar) can be rendered as a flex sibling inside the header container. All other behaviour is unchanged.

**Original licence:**

```
The MIT License (MIT)

Copyright (C) 2019, 2020, 2021 Crown Copyright
Copyright (C) 2019, 2020, 2021 Daniel A.C. Martin

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

The modified source is at [`src/theme/Header/index.js`](src/theme/Header/index.js).