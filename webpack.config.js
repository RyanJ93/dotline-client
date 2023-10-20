'use strict';

const WebpackNotifierPlugin = require('webpack-notifier');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const version = JSON.parse(fs.readFileSync('package.json').toString()).version;
const config = JSON.parse(fs.readFileSync('config/config.json').toString());

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
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [
                { loader: 'babel-loader' },
                { loader: 'thread-loader' }
            ]
        }, {
            test: /\.(scss|css)$/,
            use: [
                { loader: 'style-loader' },
                {
                    loader: 'css-loader',
                    options: {
                        modules: true
                    }
                },
                { loader: 'sass-loader' },
                { loader: 'thread-loader' }
            ]
        }]
    },
    cache: {
        type: 'filesystem',
        allowCollectingMemory: true
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: { output: { ascii_only: true } },
            parallel: true
        })]
    },
    plugins: [
        new WebpackNotifierPlugin(),
        new webpack.DefinePlugin({
            YANDEX_MAPS_KEY: JSON.stringify(config.yandexMapsKey),
            VERSION: JSON.stringify(version)
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        hot: true
    }
};
