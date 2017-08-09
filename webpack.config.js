const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

let config = {
    entry: './client/client.js',
    output: {
        filename: 'script.js',
        path: path.resolve(__dirname, './server/static'),
    },
    module: {
        rules: [
            {
                test: /\.js$/, // files ending with .js
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.jsx$/, // all files ending with .jsx
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    
    plugins: [], // empty for dev, but will have uglifyjs pushed in when building for production
    devtool: 'eval-source-map'
};

module.exports = config;

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin() // minify js
  );
}