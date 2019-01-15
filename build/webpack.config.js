const {
    resolve
} = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const nodeExternals = require('webpack-node-externals');
const path = require('path')
//判断当前运行环境是开发模式还是生产模式
var config = {};
var jsonfile = require("jsonfile");
var configfile = resolve(__dirname, "../package.json");
const packagejson = jsonfile.readFileSync(configfile);
var alias = {
    'libs': resolve(__dirname, "../app/libs"),
    'main': resolve(__dirname, "../app/main"),
    'renderer': resolve(__dirname, "../app/renderer")
}
// externals:[
//     'browserify'
// ],
externalDev = nodeExternals({
    modulesFromFile: {
        exclude: ['devDependencies'],
        include: ['dependencies']
    }
})

function noparse(content) {
    //在 dependencies 中的代码不打包，因为可以再electron 环境中直接调用
    if(content.indexOf('app\\libs')>-1){
        return false;
    }
    // for (var i in packagejson['dependencies']) {

    //     if(content.indexOf('node_modules\\'+i)>-1){
    //         console.log('node_modules\\'+i);
    //         return true;
    //     }console
    // }
    // return false;
    return false;
}
config['main'] = function (mode) {
    return {
        target: 'electron-main',
        entry: './main.ts',
        externals: [externalDev],
        node: {
            __filename: false,
            __dirname: false
        },
        devtool: mode == 'develoment' ? 'sourcemap' : false,
        context: path.resolve(__dirname, "../app/main"),
        mode: mode,
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
            noParse: noparse,
            rules: [{
                test: /\.ts?$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        configFile: path.resolve(__dirname, '../app/main/tsconfig.json')
                    }
                }],
                exclude: /node_modules/
            },

            // {
            //     test: /\.js?$/,
            //     use: {
            //         loader: 'babel-loader?cacheDirectory=true',
            //         options: {
            //             presets: ['env']
            //         }
            //     },
            //     exclude: /node_modules/,
            //     include: /app\/main/
            // },
            {
                test: /\.json$/,
                use: [{
                    loader: "json-loader"
                }]
            }
            ]
        },
        plugins: [
            new webpack.IgnorePlugin(/^\.\/locale$/, /browserify$/),
        ]
    }
}

config['renderer'] = function (mode) {
    return {
        target: 'electron-renderer',
        context: resolve(__dirname, '../app/renderer'),
        entry: {
            app: [
                './main.js'
            ]
        },
        node: {
            __filename: false,
            __dirname: false
        },
        externals: [externalDev],
        output: {
            filename: 'js/bundle.js',
            path: resolve(__dirname, '../dist/renderer'),
            publicPath: './'
        },
        mode: mode,
        resolve: {
            extensions: [
                '.js', '.jsx', '.ts', '.tsx', '.vue'
            ],
            alias: {
                'vue$': 'vue/dist/vue.js'
            }
        },
        module: {
            //module.noParse 配置哪些文件可以脱离webpack的解析
            // noParse: /node_modules\/(jquey\.js)/,
            noParse: noparse,
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
                    use: [{
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
                    },
                    {
                        loader: 'iview-loader',
                        options: {
                            prefix: false
                        }
                    }
                    ]

                },
                // {
                //     test: /\.js$/,
                //     loader: 'babel-loader'
                // },
                {
                    test: /\.jsx?$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/,
                },
                {
                    test: /\.ts?$/,
                    use: [{
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            configFile: path.resolve(__dirname, '../app/renderer/tsconfig.json')
                        }
                    }],
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
            // new webpack.HotModuleReplacementPlugin(),
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
}

config['client'] = function (mode) {
    return {
        target: 'electron-main',
        entry: './index.js',
        node: {
            __filename: false,
            __dirname: false
        },
        // externals:[
        //     'browserify'
        // ],

        externals: [externalDev],
        devtool: mode == 'develoment' ? 'sourcemap' : false,
        context: path.resolve(__dirname, "../app/renderer/client/"),
        mode: mode,
        output: {
            filename: 'client.js',
            path: resolve(__dirname, '../dist/renderer/js'),
            publicPath: resolve(__dirname, '../dist/renderer/js'),
        },
        resolve: {
            extensions: [
                '.ts', '.tsx', '.js', '.jsx'
            ]
        },
        module: {
            //module.noParse 配置哪些文件可以脱离webpack的解析
            noParse: noparse,
            rules: [{
                test: /\.ts?$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        configFile: path.resolve(__dirname, '../app/main/tsconfig.json')
                    }
                }],
                exclude: /node_modules/,
                include: [path.resolve(__dirname, '../app/renderer')]
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
                include: [path.resolve(__dirname, '../app/renderer')]
            },
            {
                test: /\.json$/,
                use: [{
                    loader: "json-loader"
                }]
            }
            ]
        },
        plugins: [
            new webpack.IgnorePlugin(/^\.\/locale$/, /browserify/),
        ]
    }
}
module.exports = function (target, mode) {
    var res = config[target](mode)
    if(!res.resolve){
        res.resolve = {};
    }
    if(!res.resolve.alias){
        res.resolve.alias = {}
    }
    Object.assign(res.resolve.alias,alias);
    
    return res;
}