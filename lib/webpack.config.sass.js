const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const browserslist = require('./browserslist');

const DEV = process.env.NODE_ENV !== 'production';

const postcssPlugins = [
  autoprefixer({
    browsers: browserslist
  })
];

if (!DEV) {
  postcssPlugins.push(cssnano());
}

module.exports = {
  watch: DEV,
  devtool: DEV ? 'source-map' : false,
  module: {
    rules: [
      {
        test: /\.(scss|sass)$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                import: false,
                sourceMap: true
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: postcssPlugins,
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true
              }
            }
          ]
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'app.css',
      allChunks: true
    })
  ]
};
