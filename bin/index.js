#!/usr/bin/env node

require('shelljs/global');

var program = require('commander'),
    path = require('path'),
    task = require('./utils/task'),
    cli  = require('./utils/cli'),
    pkgs = require('../package.json'),
    v2rx = require('./config'),
    CWD  = process.cwd();
var __mode;

program
    .version(pkgs.version)
    .option('-p, --port', 'custom debuger server port', config.port)
    .option('-s, --server', 'run static server', true)
    .arguments('[mode] [name]')
    .action(function (mode, name) {
        var config = v2rx.getConfig();
        __mode = mode;
        if (!v2rx.hasConfig() && mode !== 'init') {
            console.error('v2rx can\'t run without v2rx.config.js \n');
            process.exit(1);
        }
        // supported modes
        var modes = ['init', 'start', 'test', 'pre', 'release'];
        if (modes.indexOf(mode) === -1) {
            console.log('v2rx task miss match \n');
            cli.help();
        } else {
            // clean build directory
            rm('-rf', path.resolve(CWD, config.build));
            task[mode](name || program.port || program.server);
        }
    });

program.parse(process.argv);

if (!__mode) {
    cli.help();
}