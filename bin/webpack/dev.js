var webpack = require('webpack');
// var ExtractTextPlugin = require('extract-text-webpack-plugin');
var TransferWebpackPlugin = require('transfer-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var CWD = process.cwd();

var webpackConfig = function(config){
    var __configuration = {
        // /**
        //  * Server Configuration options
        //  * doc: http://webpack.github.io/docs/webpack-dev-server.html
        //  */
        // devServer:{
        //     contentBase: path.resolve(CWD, config.build),    //Relative directory for base of server
        //     hot: true,          //Live-reload
        //     headers: { 'Access-Control-Allow-Origin': '*' },
        //     host: config.host || '0.0.0.0',
        //     inline: true,
        //     port: config.port || 3000,    //Port Number
        //     // historyApiFallback: true,
        //     stats: {
        //         colors: true,
        //         cached: false,
        //         exclude: [/node_modules[\\\/]/]
        //     }
        // },

        /**
         * Devtool
         * doc: http://webpack.github.io/docs/configuration.html#devtool
         */
        devtool: config.devtool,

        /**
         * switch loader to debug mode
         * doc: http://webpack.github.io/docs/configuration.html#devtool
         */
        debug: true,

        /**
         * Entry points to the project
         * doc: http://webpack.github.io/docs/configuration.html#entry
         *
         * If you pass an object: Multiple entry bundles are created.
         * The key is the chunk name. The value can be a string or an array.
         */
        entry: (function(){
            if(typeof config.pages == 'object') {
                var entries = {
                    'vendor': config.vendor || ['react', 'react-dom'] // common libs bundle
                };

                for(var entry in config.pages) {
                    entries[entry] = [require.resolve('webpack-hot-middleware/client'), path.resolve(CWD, config.base, config.pages[entry])]
                }

                return entries;
            }

            return {
                'shared': [require.resolve('webpack-hot-middleware/client'), path.resolve(CWD, config.base, config.pages)],

                'vendor': config.vendor || ['react', 'react-dom'] // common libs bundle
            }
        })(),

        /**
         * Output
         * doc: http://webpack.github.io/docs/configuration.html#output
         */
        output: {
            path: path.resolve(CWD, config.build),
            publicPath: config.static[process.env.MODE],
            chunkFilename: 'js/[name]-[chunkhash:8].js',
            filename: 'js/[name].js'
        },

        /**
         * Bunch of Loaders
         * doc: http://webpack.github.io/docs/using-loaders.html
         * list: http://webpack.github.io/docs/list-of-loaders.html
         */
        module: {
            preLoaders: config.eslint ? [{
                test: /\.(js|jsx)$/,
                loader: 'eslint-loader',
                include: [path.resolve(CWD, config.base)],
                exclude: /node_modules/
            }] : [],
            loaders: [{
                test: /\.jsx?$/, // .jsx or .js files
                loader: 'babel',
                exclude: [path.resolve(CWD, 'node_modules')],
                query: {
                    stage: 0,
                    env: {
                        development: {
                            plugins: [require.resolve('babel-plugin-react-transform')],
                            extra: {
                                'react-transform': [{
                                    target: require.resolve('react-transform-hmr'),
                                    imports: ['react'],
                                    locals: ['module']
                                }]
                            }
                        }
                    }
                }
            }, {
                test: /\.css$/,
                include: [path.resolve(CWD, config.base, config.scss)],// extract style import from scss to separate css files
                loader: 'style!css!autoprefixer'
            }, {
                test: /\.less$/,
                include: [path.resolve(CWD, config.base, config.scss)],
                loader: 'style!css!autoprefixer!less?sourceMap'
            }, {
                test: /\.scss$/,
                include: [path.resolve(CWD, config.base, config.scss)],// extract style import from scss to separate css files
                loader: 'style!css!autoprefixer!sass?sourceMap&includePaths[]=' + path.resolve(CWD, 'node_modules') +
                    '&includePaths[]=' + path.resolve(CWD, 'node_modules') +
                    '&includePaths[]=' + path.resolve(CWD, config.base)
            }, {
                test: /\.css$/,
                exclude: [path.resolve(CWD, config.base, config.scss)],
                loader: 'style!css' + (config.css_modules ? '?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:8]' : '') + '!autoprefixer'
            }, {
                test: /\.less$/,
                exclude: [path.resolve(CWD, config.base, config.scss)],
                loader: 'style!css' + (config.css_modules ? '?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:8]' : '') + '!autoprefixer!less?sourceMap'
            }, {
                test: /\.scss$/,
                exclude: [path.resolve(CWD, config.base, config.scss)],// pack other styles into JS and wrapped within style at runtime
                loader: 'style!css' + (config.css_modules ? '?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:8]': '') + '!autoprefixer!sass?sourceMap' +
                    '&includePaths[]=' + path.resolve(CWD, 'node_modules') +
                    '&includePaths[]=' + path.resolve(CWD, config.base)
            }, {
                test: /\.svg/,
                loader: 'svg-url'
            }, {
                test: /\.(png|jpg|gif|jpeg)$/,
                // < 20k, otherwise file-loader is used auto
                loader: 'url?limit=' + config.base64_image_limit + '&name=' + config.assets + '/images/[name]-[hash:8].[ext]'//20k
            }, {
                test: /\.(ttf|eot|woff[1-9]?)$/,
                loader: "file?name=" + config.assets + "/fonts/[name]-[hash:8].[ext]"
            }, {
                test: /\.json$/,
                loader: "json"
            }]
        },
        /**
         * resolve loaders
         */
        resolveLoader: {
            root: path.join(__dirname, '..', '..',  'node_modules'),
            fallback: [path.resolve(CWD, 'node_modules')]
        },
        /**
         * Resolve
         * doc: doc: http://webpack.github.io/docs/configuration.html#resolve
         */
        resolve: {
            root: CWD,
            alias: config.alias,
            modulesDirectories: ["web_modules", "node_modules", 'bower_components'],
            extensions: ['', '.js', '.json', '.jsx', '.scss', '.css', '.less'],
            fallback: [path.resolve(__dirname, '..', '..', 'node_modules')]
        },

        /**
         * Plugin
         * doc: http://webpack.github.io/docs/using-plugins.html
         * list: http://webpack.github.io/docs/list-of-plugins.html
         */
        plugins: [
            // new webpack.optimize.OccurenceOrderPlugin(true),
            // new webpack.optimize.DedupePlugin(),
            // new webpack.optimize.AggressiveMergingPlugin(),
            // new webpack.optimize.MinChunkSizePlugin({ minChunkSize: 20000 }),// min 20k
            //Enables Hot Modules Replacement
            new webpack.HotModuleReplacementPlugin(),
            //Allows error warnings but does not stop compiling. Will remove when eslint is added
            new webpack.NoErrorsPlugin(),
            new webpack.DefinePlugin((function(){
                var global_defines =  {
                     'process.env': {
                         MODE: JSON.stringify(process.env.MODE),
                         NODE_ENV: JSON.stringify('development')
                     },
                     'API': JSON.stringify(config.api[process.env.MODE]),
                     'STATIC': JSON.stringify(config.static[process.env.MODE])
                };

                for(var global in config.globals) {
                     global_defines[global.toUpperCase()] = JSON.stringify(config.globals[global][process.env.MODE])
                }

                return global_defines;
            })()),
            // Split vendors
            new webpack.optimize.CommonsChunkPlugin("vendor", "js/vendor.bundle.js"),
            // common module extract
            new webpack.optimize.CommonsChunkPlugin({
                filename: "js/commons.bundle.js",
                minChunks: 3, // shared within at least 3 modules
                minSize: 10 * 1000, // 10k
                children: true // include all chunks
            }),
            // style extract as specified
            // new ExtractTextPlugin('css/[name]-[contenthash:8].css'),
            // Global modules
            // http://webpack.github.io/docs/shimming-modules.html
            new webpack.ProvidePlugin({
                React: 'react'
            }),
            new TransferWebpackPlugin(config.transfer_assets ? [{
                from: path.join(config.base, config.assets || 'assets'),
                to: path.join(config.assets || 'assets')
            }] : [], path.resolve(CWD))
        ],
        //eslint config options. Part of the eslint-loader package
        eslint: {
            configFile: path.resolve(CWD, '.eslintrc')
        }
    }

    // Generate HTML
    if(typeof config.pages == 'object') {

        // multi-entry config
        for(var entry in config.pages) {
            __configuration.plugins.push(new HtmlWebpackPlugin({
                chunks: [entry, 'vendor'],
                filename: entry + '.html',
                title: config.template.title,
                keywords: config.template.keywords,
                description: config.template.description,
                viewport: config.template.viewport,
                template: config.template.path,
                favicon: config.template.favicon
            }))
        }

    } else {
        __configuration.plugins.push(new HtmlWebpackPlugin({
            chunks: ['shared', 'vendor'],
            filename: 'index.html',
            title: config.template.title,
            keywords: config.template.keywords,
            description: config.template.description,
            viewport: config.template.viewport,
            template: config.template.path,
            favicon: config.template.favicon
        }))
    }

    return __configuration;
};

module.exports = webpackConfig;
