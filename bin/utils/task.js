
require('shelljs/global');
var path = require('path'),
    fs = require('fs'),
    config = require('../config'),
    server = require('./server'),
    v2ex = config.getConfig(),
    CWD = process.cwd();


function check_modules() {
    if (!fs.existsSync(path.resolve(CWD, 'node_modules'))) {
        console.log('install node modules ... \n');
        exec('npm install');
    }
}

// use webpack in node_modules/.bin/webpack
var webpack = path.resolve(__dirname, '..', '..', 'node_modules', '.bin', 'webpack');

module.exports = {
    start: function(port) {
        check_modules();
        process.env.MODE = 'start';
        v2ex.port = port || v2ex.port;
        server.start(v2ex);
    },
    test: function(start_server) {
        check_modules();
        process.env.MODE = 'test';
        exec(webpack + ' --config ' + path.resolve(__dirname, '..', 'webpack', 'prod.js') + ' --progress');
        start_server && server.start(v2ex);
    },
    pre: function(start_server) {
        check_modules();
        process.env.MODE = 'pre';
        exec(webpack + ' --config ' + path.resolve(__dirname, '..', 'webpack', 'prod.js') + ' --progress')
        start_server && server.start(v2ex);
    },
    release: function(start_server) {
        check_modules();
        process.env.MODE = 'release';
        exec(webpack + ' --config ' + path.resolve(__dirname, '..', 'webpack', 'prod.js') + ' --progress')
        start_server && server.start(v2ex);
    },
    upgrade: function() {
        console.log('正在升级...');
        exec('npm install v2ex -g');
    },
    // page: function(name) {
    //     if (!name || !name.length) {
    //         console.log('Page name is required');
    //         process.exit(1);
    //     }

    //     template.createPage(v2ex, name);
    //     console.log('页面', name, '创建成功]\n');
    //     console.log('目录:' + [v2ex.base, v2ex.pages, name].join('/'));
    // },
    // component: function(name) {
    //     if (!name || !name.length) {
    //         console.log('Component name is required');
    //         process.exit(1);
    //     }

    //     name = name[0].toUpperCase() + name.slice(1);

    //     template.createComponent(v2ex, name);
    //     console.log('组件', name, '创建成功\n');
    //     console.log('目录:' + [v2ex.base, v2ex.components, name].join('/'));
    // },
    init: function(name, esmode) {
        if (!name || !name.length) {
            console.log('App name is required');
            process.exit(1);
        }

        cp('-R', path.resolve(__dirname, '..', 'templates', 'app-redux/*'), path.resolve(CWD, name));
        console.log('项目', name, '创建成功');
    },
    cancel: function () {
        exec('ctrl c');
    }
}
