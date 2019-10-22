const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

var commonConfig = {
  output: {
    filename: 'json-schema-vuer.min.js',
    libraryTarget: 'umd',
    library: 'JsonSchemaVuer'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // this will apply to both plain `.js` files
      // AND `<script>` blocks in `.vue` files
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      // this will apply to both plain `.css` files
      // AND `<style>` blocks in `.vue` files
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    // make sure to include the plugin for the magic
    new VueLoaderPlugin(),
  ]
}

module.exports=[

  // for the browser based implementation
  // browser based implementation
  merge(commonConfig, {
    entry: path.resolve(__dirname + '/../src/index.js'),
    output: {
      filename: 'json-schema-vuer.min.js'
    }
  }),

  // for the node based implementation
  merge(commonConfig, {
    entry: path.resolve(__dirname + '/../src/index.js'),
    output: {
      path: path.resolve(__dirname + '/../dist/')
    }
  })
]