var webpack = require('webpack');
// var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var TransferWebpackPlugin = require('transfer-webpack-plugin');
// var WebpackMD5Hash = require('webpack-md5-hash');
var path = require('path');
var fs = require('fs');
var CWD = process.cwd();

var config = require('../config').getConfig();

var ENV = process.env.MODE == 'test' ? 'development' : 'production';

var PRODUCT_CONFIG = {
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
                entries[entry] = path.resolve(CWD, config.base, config.pages[entry]);
            }

            return entries;
        }

        return {
            'shared': path.resolve(CWD, config.base, config.pages),
            'vendor': config.vendor || ['react', 'react-dom']
        };
    })(),

    /**
     * Output
     * doc: http://webpack.github.io/docs/configuration.html#output
     */
    output: {
        path: path.resolve(CWD, config.build),
        publicPath: config.static[process.env.MODE],
        chunkFilename: 'js/[name]-[chunkhash:8].js',
        filename: 'js/[name]-[chunkhash:8].js'
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
            test: /\.jsx?$/,
            loaders: ['babel?stage=0'],
            exclude: /node_modules/,
            include: CWD
        }, {
            test: /\.css$/,
            include: [path.resolve(CWD, config.base, config.scss)],
            loader: 'style!css!autoprefixer'
        }, {
            test: /\.scss$/,
            include: [path.resolve(CWD, config.base, config.scss)],
            loader: 'style!css!autoprefixer!sass?' +
                'includePaths[]=' + path.resolve(CWD, 'node_modules') +
                '&includePaths[]=' + path.resolve(CWD, config.base)
        }, {
            test: /\.less$/,
            include: [path.resolve(CWD, config.base, config.scss)],
            loader: 'style!css!autoprefixer!less'
        }, {
            test: /\.css$/,
            exclude: [path.resolve(CWD, config.base, config.scss)],
            loader: 'style!css' + (config.css_modules ? '?modules&importLoaders=1&localIdentName=[hash:base64:8]' : '') + '!autoprefixer'
        }, {
            test: /\.less$/,
            exclude: [path.resolve(CWD, config.base, config.scss)],
            loader: 'style!css' + (config.css_modules ? '?modules&importLoaders=1&localIdentName=[hash:base64:8]' : '') + '!autoprefixer!less'
        }, {
            test: /\.scss$/,
            exclude: [path.resolve(CWD, config.base, config.scss)],
            loader: 'style!css' + (config.css_modules ? '?modules&importLoaders=1&localIdentName=[hash:base64:8]' : '') + '!autoprefixer!sass?' +
                'includePaths[]=' + path.resolve(CWD, 'node_modules') +
                '&includePaths[]=' + path.resolve(CWD, config.base)
        }, {
            test: /\.svg/,
            loader: 'svg-url'
        }, {
            test: /\.(png|jpg|gif|jpeg)$/,
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
        root: path.join(__dirname, '..', '..', 'node_modules')
    },
    resolve: {
        root: CWD,
        alias: config.alias,
        modulesDirectories: ["web_modules", "node_modules", 'bower_components'],
        extensions: ['', '.js', '.json', '.jsx', '.scss', '.css', '.less']
    },
    plugins: [
        // new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.optimize.DedupePlugin(),
        // new webpack.NamedModulesPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.MinChunkSizePlugin({ minChunkSize: 20000 }),// min 20k
        // new WebpackMD5Hash(),
        new webpack.optimize.CommonsChunkPlugin({names: ["vendor", "manifest"]}),
        new webpack.optimize.CommonsChunkPlugin({
            filename: 'js/commons-[chunkhash:8].js',
            children: true,
            minSize: 10 * 1000, // 10k
            minChunks: 3
        }),
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
        configFile: path.resolve(__dirname, '..', '..', '.eslintrc')
    }
};

var is_prod = ENV == 'production';

is_prod && PRODUCT_CONFIG.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            drop_console: true
        }
    })
);

if(typeof config.pages == 'object') {

    // for multi-entry configuration

    for(var entry in config.pages) {

        PRODUCT_CONFIG.plugins.push(new HtmlWebpackPlugin({
            filename: entry + '.html',
            chunks: [entry, 'vendor', 'manifest'],
            excludeChunks: is_prod ? ['manifest'] : [],
            title: config.template.title,
            keywords: config.template.keywords,
            description: config.template.description,
            viewport: config.template.viewport,
            // template: config.template.path,
            favicon: config.template.favicon,
            minify: is_prod ? {
                collapseWhitespace: true,
                minifyJS: true,
                minifyCSS: true,
                removeComments: true
            } : {},
            templateContent: function(templateParams, compilation) {
                is_prod &&  Object.keys(compilation.assets).forEach(function(key) {
                  if (key.indexOf('manifest') !== -1) {
                    templateParams.chunkManifest = compilation.assets[key]._value;
                    delete compilation.assets[key];
                  }
                })

                var indexTemplate = fs.readFileSync(config.template.path, 'utf8');
                var tmpl = require('blueimp-tmpl').tmpl;

                return tmpl(indexTemplate, templateParams);

            }
        }));

    }

} else {

    PRODUCT_CONFIG.plugins.push(new HtmlWebpackPlugin({
        filename: 'index.html',
        chunks: ['shared', 'vendor', 'manifest'],
        excludeChunks: is_prod ? ['manifest'] : [],
        title: config.template.title,
        keywords: config.template.keywords,
        description: config.template.description,
        viewport: config.template.viewport,
        // template: config.template.path,
        favicon: config.template.favicon,
        minify: is_prod ? {
            collapseWhitespace: true,
            minifyJS: true,
            minifyCSS: true,
            removeComments: true
        } : {},
        templateContent: function(templateParams, compilation) {
            is_prod &&  Object.keys(compilation.assets).forEach(function(key) {
              if (key.indexOf('manifest') !== -1) {
                templateParams.chunkManifest = compilation.assets[key]._value;
                delete compilation.assets[key];
              }
            })

            var indexTemplate = fs.readFileSync(config.template.path, 'utf8');
            var tmpl = require('blueimp-tmpl').tmpl;

            return tmpl(indexTemplate, templateParams);

        }
    }));

}

module.exports = PRODUCT_CONFIG;
