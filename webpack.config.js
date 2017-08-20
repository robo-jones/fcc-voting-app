const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

let clientConfig = {
    name: 'client build',
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

if (process.env.NODE_ENV === 'production') {
    clientConfig.plugins.push(new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }));
    clientConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true
      },
      comments: false
    }));
}

const serverConfig = {
    name: 'server build',
    entry: './server/server.js',
    output: {
        filename: 'build.js',
        path: path.resolve(__dirname, './server')
    },
    target: 'node',
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    },
    externals: [nodeExternals()],
};

module.exports = [clientConfig, serverConfig];

