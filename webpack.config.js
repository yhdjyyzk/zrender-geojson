var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool: false,
    entry: {
        bundle: './src/app.js'
    },
    output: {
        path: __dirname + '/dist/',
        filename: '[name].js',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // }),
    ]
    // devtool: 'inline-source-map' //可以在调试面板source中打开源文件
}