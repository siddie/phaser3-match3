const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const path = require('path')

module.exports = {
  mode: 'development',

  entry: {
    index: './src/index',
  },
  
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  },
  
  devServer: {
    host: '0.0.0.0',
    port: 8080
  },

  devtool: 'cheap-source-map',
  
  resolve: {
    extensions: ['.js', '.json']
  },

  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader', include: path.resolve(__dirname, 'src') },
      // {
      //   test: /\.scss$/,
      //   use: ['style-loader', 'css-loader', 'sass-loader'],
      //   include: path.resolve(__dirname, 'src/scss')
      // }
      // {
      //   test: /\.(bmp|gif|jpg|jpeg|png|svg)$/,
      //   include: path.resolve(__dirname, 'src/images'),
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: '[name].[ext]'
      //       }
      //     }
      //   ]
      // }
    ]
  },

  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },

  plugins: [
    new HtmlWebpackPlugin({
      favicon: './favicon.ico',
      template: path.resolve(__dirname, 'index.html')
    })
  ]
}