const {
    resolve
} = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const path = require('path')
//判断当前运行环境是开发模式还是生产模式
const nodeEnv = process.env.NODE_ENV || 'development';
const isPro = nodeEnv === 'production';
console.log("当前运行环境：", nodeEnv);
module.exports = {
    target: 'electron-renderer',
    mode: nodeEnv,
    context: resolve(__dirname, '../app/renderer'),
    entry: {
        app: [
            './main.js'
        ]
    },
    output: {
        filename: 'js/bundle.js',
        path: resolve(__dirname, '../dist/renderer'),
        publicPath: 'http://localhost:3000/'
    },
    resolve: {
        extensions: [
            '.js', '.jsx', '.ts', '.tsx', '.vue'
        ],
        alias: {
            'vue$': 'vue/dist/vue.js'
        }
    },

    devServer: {
        hot: true,
        contentBase: resolve(__dirname, '../dist/renderer'),
        publicPath: '/',
        port: '3000'
    },

    module: {
        //module.noParse 配置哪些文件可以脱离webpack的解析
        noParse: /node_modules\/(jquey\.js)/,
        rules: [
            //html
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader'
                }]
            },
            {
                test: /\.vue$/,
                use: [
                    {
                        loader: 'vue-loader',
                        options: {
                            loaders: {
                                // Customize to your liking
                                js: 'babel-loader',
                                scss: [
                                    'style-loader',
                                    'css-loader',
                                    'sass-loader'
                                ]
                            }
                        }
                    }
                    ,
                    {
                        loader: 'iview-loader',
                        options: {
                            prefix: false
                        }
                    }
                ]

            },
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            {
                test: /\.jsx?$/,
                use: ['babel-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            configFile: path.resolve(__dirname, '../app/renderer/tsconfig.json')
                        }
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.(css)$/,
                use: [
                    "vue-style-loader", "css-loader"
                ]

            },
            {
                test: /\.(scss)$/,
                use: [
                    "vue-style-loader", "css-loader", "sass-loader"
                ]
            },
            {
                test: /\.(less)$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    {
                        loader: 'less-loader'
                    }
                ],
                // exclude: /node_modules/,
                // include: /src/
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: [{
                    loader: "url-loader",
                    query: {
                        name: 'images/[name].[ext]?v=[hash:5]',
                        limit: 20000
                    }
                }, {
                    loader: 'image-webpack-loader',
                    options: {
                        query: {
                            mozjpeg: {
                                progressive: true,
                                quality: 65
                            },
                            pngquant: {
                                quality: "10-20",
                                speed: 4
                            },
                            svgo: {
                                plugins: [{
                                    removeViewBox: false
                                }, {
                                    removeEmptyAttrs: false
                                }]
                            },
                            gifsicle: {
                                optimizationLevel: 7,
                                interlaced: false
                            },
                            optipng: {
                                optimizationLevel: 7,
                                interlaced: false
                            }
                        }
                    }
                }

                ]
            }, {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                use: [{
                    loader: 'url-loader?limit=8192'
                }]

            }, {
                test: /\.(mp3|mp4|ogg)$/,
                use: [{
                    loader: "file-loader?name=media/[name].[ext]"
                }]
            }, {
                test: /\.json$/,
                use: [{
                    loader: "json-loader"
                }]
            }
        ]
    },
    plugins: [
        //热更新
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new VueLoaderPlugin(),
        //html模板
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: 'body',
        })
    ]
}