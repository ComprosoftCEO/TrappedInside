const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  devtool: false /* 'inline-source-map', */,
  devServer: {
    contentBase: './build',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Game Engine',
      template: 'src/index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(gltf|glb)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(wav|mp3|ogg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.glsl$/i,
        type: 'asset/source',
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      engine: path.resolve(__dirname, 'src/engine'),
      areas: path.resolve(__dirname, 'src/areas'),
      entities: path.resolve(__dirname, 'src/entities'),
      assets: path.resolve(__dirname, 'assets/'),
    },
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
  },
};
