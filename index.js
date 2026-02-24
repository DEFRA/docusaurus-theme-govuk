const path = require('path');
const fs = require('fs');

module.exports = function themeGovuk(context, options) {
  const siteDir = context.siteDir;

  // Resolve webpack and plugins from the consumer's node_modules.
  // Top-level require() would fail when installed via file: (symlink) because
  // the theme directory has no local node_modules in that case.
  const webpack = require(require.resolve('webpack', { paths: [siteDir] }));
  const CopyPlugin = require(require.resolve('copy-webpack-plugin', { paths: [siteDir] }));

  const themePath = path.resolve(__dirname, './src/theme');
  const shimPath = path.resolve(__dirname, './src/lib/react-foundry-router-shim.js');

  // Resolve govuk-frontend assets directory from the consumer's node_modules
  const govukFrontendAssetsPath = path.dirname(
    require.resolve('govuk-frontend/package.json', { paths: [siteDir] })
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
      // Helper: resolve a package from the consumer's siteDir.
      // Uses require.resolve with paths so it follows Node's resolution
      // (handles hoisted AND nested node_modules like @docusaurus/core/node_modules/react-router-dom).
      // Also handles ESM-only packages (e.g. @mdx-js/react) that don't export ./package.json.
      // Find the directory of an installed package by walking node_modules up
      // the filesystem from each search path. Uses only fs.existsSync — no
      // require.resolve — so it works even for ESM-only packages (e.g.
      // @mdx-js/react) where jiti's require.resolve shim fails at runtime.
      // Falls back to __dirname so that packages installed in the theme's own
      // node_modules are found when consuming via file: (local dev).
      function findPkgDir(pkg, searchPaths) {
        const allSearchPaths = [...searchPaths, __dirname];
        for (const startDir of allSearchPaths) {
          let dir = startDir;
          while (true) {
            const candidate = path.join(dir, 'node_modules', pkg);
            if (fs.existsSync(path.join(candidate, 'package.json'))) {
              return candidate;
            }
            const parent = path.dirname(dir);
            if (parent === dir) break; // filesystem root
            dir = parent;
          }
        }
        throw new Error(
          `Could not find package "${pkg}" from [${allSearchPaths.join(', ')}]`
        );
      }
      function resolveFromSite(pkg) {
        try {
          return findPkgDir(pkg, [siteDir]);
        } catch {
          // Fallback: try resolving from @docusaurus/core's location (where
          // react-router may be nested in Docusaurus 3.9.x).
          const docuCoreDir = findPkgDir('@docusaurus/core', [siteDir]);
          return findPkgDir(pkg, [docuCoreDir]);
        }
      }

      // Resolve the CJS entry point of a package without going through jiti.
      // Reads the package's own package.json `main` field (CJS) rather than
      // using require.resolve which jiti may fail on.
      function findPkgEntry(pkg) {
        const pkgDir = findPkgDir(pkg, [siteDir]);
        const pkgJson = JSON.parse(
          fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')
        );
        const main = pkgJson.main || 'index.js';
        return path.resolve(pkgDir, main);
      }

      // Use MiniCssExtractPlugin for production/server builds, style-loader for dev/client
      let MiniCssExtractPlugin;
      if (!isServer && process.env.NODE_ENV === 'production') {
        MiniCssExtractPlugin = require('mini-css-extract-plugin');
        if (!config.plugins) config.plugins = [];
        config.plugins.push(new MiniCssExtractPlugin({ filename: 'assets/css/govuk-theme.[contenthash].css' }));
      }
      return {
        // Also resolve webpack loaders from the theme's own node_modules.
        // When consumed via file: (local dev), loaders like style-loader,
        // css-loader etc. live in the theme dir, not the consumer's node_modules.
        resolveLoader: {
          modules: ['node_modules', path.resolve(__dirname, 'node_modules')],
        },
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
            findPkgEntry('@react-foundry/component-helpers')
          ),
          new webpack.NormalModuleReplacementPlugin(
            /^@react-foundry\/client-component-helpers$/,
            findPkgEntry('@react-foundry/client-component-helpers')
          ),
          new webpack.NormalModuleReplacementPlugin(
            /^@react-foundry\/uri$/,
            findPkgEntry('@react-foundry/uri')
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
              // Force .docusaurus generated files (registry.js, routes.js etc.)
              // to javascript/auto so that webpack's require.resolveWeak() magic
              // transforms work.  Without this, a consumer with "type":"module"
              // in their package.json causes webpack to treat these files as pure
              // ESM, leaving require.resolveWeak() untransformed in the browser
              // bundle, which throws "require is not defined" at runtime.
              test: /\.docusaurus[/\\][^/\\]+\.js$/,
              type: 'javascript/auto',
            },
            {
              test: /\.scss$/,
              use: [
                (!isServer && process.env.NODE_ENV === 'production')
                  ? require('mini-css-extract-plugin').loader
                  : 'style-loader',
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
                    implementation: require(require.resolve('sass', { paths: [siteDir] })),
                    additionalData: (content, loaderContext) => {
                      if (/\.scss$|\.sass$/.test(loaderContext.resourcePath)) {
                        return `$govuk-assets-path: '${baseUrl}assets/';\n` + content;
                      }
                      return content;
                    },
                    sassOptions: {
                      includePaths: [
                        path.join(siteDir, 'node_modules'),
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
