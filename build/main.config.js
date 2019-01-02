const {
    resolve
} = require('path');
const webpack = require('webpack');
const path = require('path')
//判断当前运行环境是开发模式还是生产模式

module.exports = {
    target: 'electron-main',
    entry: './main.ts',
    node: {
        __filename: false,
        __dirname: false
    },
    devtool: 'sourcemap',
    context: path.resolve(__dirname, "../app/main"),
    output: {
        filename: 'index.js',
        path: resolve(__dirname, '../dist/main'),
        publicPath: resolve(__dirname, '../dist/main'),
    },
    resolve: {
        extensions: [
            '.ts', '.tsx', '.js', '.jsx'
        ]
    },
    module: {
        //module.noParse 配置哪些文件可以脱离webpack的解析
        noParse: /node_modules\/(jquey\.js)/,
        rules: [
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            configFile: path.resolve(__dirname, '../app/main/tsconfig.json')
                        }
                    }
                ],
                exclude: /node_modules/
            },

            {
                test: /\.js?$/,
                use: {
                    loader: 'babel-loader?cacheDirectory=true',
                    options: {
                        presets: ['env']
                    }
                },
                exclude: /node_modules/,
                include: /app\/main/
            },
            {
                test: /\.json$/,
                use: [{
                    loader: "json-loader"
                }]
            }
        ]
    }
}