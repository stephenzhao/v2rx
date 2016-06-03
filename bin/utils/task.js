
require('shelljs/global');
var path = require('path'),
    fs = require('fs'),
    config = require('../config'),
    server = require('./server'),
    v2rx = config.getConfig(),
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
        v2rx.port = port || v2rx.port;
        server.start(v2rx);
    },
    test: function(start_server) {
        check_modules();
        process.env.MODE = 'test';
        exec(webpack + ' --config ' + path.resolve(__dirname, '..', 'webpack', 'prod.js') + ' --progress --color');
        start_server && server.start(v2rx);
    },
    pre: function(start_server) {
        check_modules();
        process.env.MODE = 'pre';
        exec(webpack + ' --config ' + path.resolve(__dirname, '..', 'webpack', 'prod.js') + ' --progress --color')
        start_server && server.start(v2rx);
    },
    release: function(start_server) {
        check_modules();
        process.env.MODE = 'release';
        exec(webpack + ' --config ' + path.resolve(__dirname, '..', 'webpack', 'prod.js') + ' --progress --color')
        start_server && server.start(v2rx);
    },
    upgrade: function() {
        console.log('正在升级...');
        exec('npm install v2rx -g');
    },
    page: function(name) {
        if (!name || !name.length) {
            console.log('Page name is required');
            process.exit(1);
        }

        template.createPage(v2rx, name);
        console.log('页面', name, '创建成功]\n');
        console.log('目录:' + [v2rx.base, v2rx.pages, name].join('/'));
    },
    component: function(name) {
        if (!name || !name.length) {
            console.log('Component name is required');
            process.exit(1);
        }

        name = name[0].toUpperCase() + name.slice(1);

        template.createComponent(v2rx, name);
        console.log('组件', name, '创建成功\n');
        console.log('目录:' + [v2rx.base, v2rx.components, name].join('/'));
    },
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
