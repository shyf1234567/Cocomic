import path from 'path';
import webpack from 'webpack';
import postcssCssnext from 'postcss-cssnext';
import postcssImport from 'postcss-import';

import AddAssetHtmlPlugin from 'add-asset-html-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ProgressBarWebpackPlugin from 'progress-bar-webpack-plugin';

import * as ReactManifest from './frontend/dist/dll/react_manifest.json'; // eslint-disable-line import/no-unresolved
import * as ImmutableManifest from './frontend/dist/dll/immutable_manifest.json'; // eslint-disable-line import/no-unresolved
import * as MaterializeManifest from './frontend/dist/dll/materialize_manifest.json'; // eslint-disable-line import/no-unresolved
import * as MiscManifest from './frontend/dist/dll/misc_manifest.json'; // eslint-disable-line import/no-unresolved

export default {
  // The base directory, an absolute path, for resolving entry points and loaders from configuration
  context: path.resolve(__dirname),

  // Start entry point(s)
  entry: {
    app: [
      // Important! 'react-hot-loader/patch' must goes first
      // https://github.com/gaearon/redux-devtools/commit/64f58b7010a1b2a71ad16716eb37ac1031f93915#diff-efacb933fc2cf0fd7e8dacf55a958839
      'react-hot-loader/patch',
      'webpack-hot-middleware/client',
      './frontend/src/index',
    ],
  },

  // Affecting the output of the compilation
  output: {
    // path: the output directory as an absolute path (required)
    path: path.resolve(__dirname, 'frontend/dist/dev'),
    // filename: specifies the name of output file on disk (required)
    filename: '[name].[hash:10].js',
    // publicPath: specifies the public URL of the output resource directory
    // port number should be the same as backend/config.json http_port
    // https://webpack.js.org/configuration/output/#output-publicpath
    publicPath: 'http://localhost:3003/',
  },

  // Determine how the different types of modules within a project will be treated
  module: {
    rules: [
      // Use babel-loader for js(x) files
      {
        test: /\.jsx?$/,
        use: [
          { loader: 'babel-loader' },
        ],
        exclude: /node_modules/,
      },
      // Use a list of loaders to load css files
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { importLoaders: 1 } }, // https://github.com/webpack-contrib/css-loader#importloaders
          { loader: 'postcss-loader', options: { plugins: () => [postcssImport, postcssCssnext] } },
        ],
      },
      // Use a list of loaders to load scss files
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { importLoaders: 2 } },
          { loader: 'postcss-loader', options: { plugins: () => [postcssImport, postcssCssnext] } },
          { loader: 'sass-loader' },
        ],
      },
      // Use url-loader to load images in development
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          { loader: 'url-loader', options: { limit: 10000 } },
          { loader: 'image-webpack-loader', options: { bypassOnDebug: true } },
        ],
      },
      // Use file-loader to load font related files and icon
      {
        test: /\.(eot|woff2?|ttf|ico)$/,
        use: [
          { loader: 'file-loader', options: { name: '[name].[ext]' } },
        ],
      },
    ],
  },

  plugins: [
    // Enable hot module reload, if have --hot parameter in npm script, then this line must be removed!
    new webpack.HotModuleReplacementPlugin(),
    // Better webpack module name display
    new webpack.NamedModulesPlugin(),
    // jQuery support
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'root.jQuery': 'jquery',
    }),
    // Load pre-build dll reference files
    new webpack.DllReferencePlugin({ manifest: ReactManifest }),
    new webpack.DllReferencePlugin({ manifest: MaterializeManifest }),
    new webpack.DllReferencePlugin({ manifest: ImmutableManifest }),
    new webpack.DllReferencePlugin({ manifest: MiscManifest }),
    // Better building progress display
    new ProgressBarWebpackPlugin({
      clear: false,
    }),
    // Generate html file to dist folder
    new HtmlWebpackPlugin({
      title: 'Cocomic',
      template: 'frontend/template/index.ejs',
    }),
    // Add dll reference files to html
    new AddAssetHtmlPlugin([
      { filepath: 'frontend/dist/dll/react_dll.js', includeSourcemap: false },
      { filepath: 'frontend/dist/dll/immutable_dll.js', includeSourcemap: false },
      { filepath: 'frontend/dist/dll/materialize_dll.js', includeSourcemap: false },
      { filepath: 'frontend/dist/dll/misc_dll.js', includeSourcemap: false },
    ]),
  ],

  // Change how modules are resolved
  resolve: {
    // What directories should be searched when resolving modules
    modules: [
      'node_modules',
      'frontend/src',
    ],
    // Automatically resolve certain extensions (Ex. import 'folder/name(.ext)')
    extensions: [
      '.js',
      '.jsx',
      '.json',
      '.scss',
    ],
  },

  // Source map mode
  // https://webpack.js.org/configuration/devtool
  devtool: 'eval-source-map',
};
