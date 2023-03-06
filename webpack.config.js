'use strict';

const WebpackNotifierPlugin = require('webpack-notifier');
const path = require('path');

module.exports = {
    devtool: 'eval-source-map',
    entry: {
        index: ['babel-polyfill', './index.jsx']
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'public')
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    module: {
        rules: [{
            test: /\.svg$/,
            use: ['@svgr/webpack']
        }, {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        }, {
            test: /\.scss$/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader",
                options: {
                    modules: true
                }
            }, {
                loader: "sass-loader"
            }]
        }]
    },
    plugins: [new WebpackNotifierPlugin()]
};
