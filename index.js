const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = function themeGovuk(context, options) {
  const themePath = path.resolve(__dirname, './src/theme');
  const shimPath = path.resolve(__dirname, './src/lib/react-foundry-router-shim.js');

  // Resolve govuk-frontend assets directory from this package's dependencies
  const govukFrontendAssetsPath = path.dirname(
    require.resolve('govuk-frontend/package.json')
  );

  // The base URL for this Docusaurus site (e.g. '/interactive-map/')
  const baseUrl = context.baseUrl || '/';

  return {
    name: 'docusaurus-theme-govuk',

    getThemePath() {
      return './src/theme';
    },

    getPathsToWatch() {
      return [
        path.join(themePath, '**/*.js'),
        path.resolve(__dirname, './src/css/**/*.{scss,css}'),
      ];
    },

    getClientModules() {
      return [path.resolve(__dirname, './src/css/theme.scss')];
    },

    configureWebpack(config, isServer, utils) {
      // Resolve React from the consumer (siteDir) to avoid dual-instance issues.
      // The theme ships its own node_modules/react via `file:` linking,
      // so we must force all React imports to the consumer's single copy.
      const siteDir = context.siteDir;

      // Helper: resolve a package from the consumer's siteDir.
      // Uses require.resolve with paths so it follows Node's resolution
      // (handles hoisted AND nested node_modules like @docusaurus/core/node_modules/react-router-dom).
      function resolveFromSite(pkg) {
        try {
          return path.dirname(
            require.resolve(`${pkg}/package.json`, { paths: [siteDir] })
          );
        } catch {
          // Fallback: try resolving from @docusaurus/core (where react-router is nested in 3.9.x)
          const docuCorePath = path.dirname(
            require.resolve('@docusaurus/core/package.json', { paths: [siteDir] })
          );
          return path.dirname(
            require.resolve(`${pkg}/package.json`, { paths: [docuCorePath] })
          );
        }
      }

      return {
        resolve: {
          extensions: ['.mjs', '.js', '.jsx', '.json', '.scss'],
          fullySpecified: false,
          alias: {
            // Deduplicate React — always use the consumer's copy
            'react': resolveFromSite('react'),
            'react-dom': resolveFromSite('react-dom'),
            'react/jsx-runtime': path.join(resolveFromSite('react'), 'jsx-runtime'),
            'react/jsx-dev-runtime': path.join(resolveFromSite('react'), 'jsx-dev-runtime'),
            // Deduplicate React Router — always use the consumer's copy
            // (Docusaurus creates the Router context with its copy; we must read from the same copy)
            'react-router': resolveFromSite('react-router'),
            'react-router-dom': resolveFromSite('react-router-dom'),
            'react-router-config': resolveFromSite('react-router-config'),
            // Ensure @mdx-js/react resolves from the consumer's node_modules.
            // When installed from npm the theme ships no node_modules of its own,
            // so we must point webpack at the copy already present in the site.
            '@mdx-js/react': resolveFromSite('@mdx-js/react'),
          },
        },
        plugins: [
          // Copy GOV.UK assets (fonts, images, manifest, rebrand) to the build
          // output so they can be served statically. The SCSS outputs url()
          // references via $govuk-assets-path pointing to /assets/; we must
          // ensure the actual files exist at that path in the build.
          new CopyPlugin({
            patterns: [
              {
                from: path.join(govukFrontendAssetsPath, 'dist/govuk/assets'),
                to: path.resolve(config.output.path || 'build', 'assets'),
                noErrorOnMissing: true,
              },
            ],
          }),
          // Shim @react-foundry/router to bridge React Router v5 (Docusaurus) to v6 API
          new webpack.NormalModuleReplacementPlugin(
            /@react-foundry\/router/,
            shimPath
          ),
          // Redirect @react-foundry packages to their CJS entry points.
          // The .mjs entry points use extensionless re-exports (e.g. export * from './classes')
          // which fail under webpack's fullySpecified enforcement for .mjs files.
          new webpack.NormalModuleReplacementPlugin(
            /^@react-foundry\/component-helpers$/,
            require.resolve('@react-foundry/component-helpers')
          ),
          new webpack.NormalModuleReplacementPlugin(
            /^@react-foundry\/client-component-helpers$/,
            require.resolve('@react-foundry/client-component-helpers')
          ),
          new webpack.NormalModuleReplacementPlugin(
            /^@react-foundry\/uri$/,
            require.resolve('@react-foundry/uri')
          ),
          // Resolve asset paths from @not-govuk packages to govuk-frontend
          new webpack.NormalModuleReplacementPlugin(
            /^\.\.\/\.\.\/assets\/(images|fonts)\//,
            (resource) => {
              const assetType = resource.request.includes('/images/') ? 'images' : 'fonts';
              const fileName = resource.request.split('/').pop();
              resource.request = path.join(
                govukFrontendAssetsPath,
                `dist/govuk/assets/${assetType}/${fileName}`
              );
            }
          ),
          // Resolve govuk-frontend font paths from @not-govuk/page
          new webpack.NormalModuleReplacementPlugin(
            /^\.\.\/\.\.\/node_modules\/govuk-frontend\/dist\/govuk\/assets\/(fonts|images)\//,
            (resource) => {
              const assetType = resource.request.includes('/fonts/') ? 'fonts' : 'images';
              const fileName = resource.request.split('/').pop();
              resource.request = path.join(
                govukFrontendAssetsPath,
                `dist/govuk/assets/${assetType}/${fileName}`
              );
            }
          ),
          // Null out the font SCSS wrappers from @not-govuk/page.
          // GovUKPage.scss imports gds-transport.css, and NotGovUKPage.scss
          // imports roboto.css. These contain @font-face rules with relative
          // URLs that, when inlined by sass and processed by css-loader,
          // produce hashed font assets that are corrupt (OTS parsing errors).
          // The SCSS pipeline (govuk-frontend _font-faces.scss) already
          // provides working @font-face declarations for GDS Transport with
          // the correct baseUrl-prefixed URLs, so these are redundant.
          // Match both the relative request (../assets/X.scss) from JS files
          // and any absolute-path form that webpack may resolve.
          new webpack.NormalModuleReplacementPlugin(
            /\/?(\.\.\/)?assets\/(GovUKPage|NotGovUKPage)\.scss$/,
            path.resolve(__dirname, 'src/lib/empty-module.js')
          ),
        ],
        module: {
          rules: [
            {
              test: /\.m?js$/,
              resolve: {
                fullySpecified: false,
              },
            },
            {
              test: /\.scss$/,
              use: [
                'style-loader',
                {
                  loader: 'css-loader',
                  options: {
                    importLoaders: 2,
                    url: {
                      filter: (url) => {
                        // Don't process absolute asset URLs — they are served as static files.
                        // Matches both /assets/ and /<baseUrl>assets/ patterns.
                        if (url.startsWith('/assets/') || url.startsWith(baseUrl + 'assets/')) {
                          return false;
                        }
                        return true;
                      },
                    },
                  },
                },
                'postcss-loader',
                {
                  loader: 'sass-loader',
                  options: {
                    implementation: require('sass'),
                    // Override GOV.UK asset path to include the Docusaurus baseUrl.
                    // The default '../../assets/' produces URLs without baseUrl,
                    // causing 404s when baseUrl is not '/'.
                    // Only prepend for SCSS/Sass files — plain CSS can't use Sass variables.
                    additionalData: (content, loaderContext) => {
                      if (/\.scss$|\.sass$/.test(loaderContext.resourcePath)) {
                        return `$govuk-assets-path: '${baseUrl}assets/';\n` + content;
                      }
                      return content;
                    },
                    sassOptions: {
                      includePaths: [
                        path.resolve(__dirname, 'node_modules'),
                      ],
                      quietDeps: true,
                      silenceDeprecations: ['import', 'if-function'],
                    },
                  },
                },
              ],
            },
          ],
        },
      };
    },
  };
};
