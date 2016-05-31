var path = require('path'),
    fs   = require('fs'),
    CWD  = process.cwd();
    defaultConfig = require('./v2rx.config.js');

function extend(target, source){
    var hasOwnProperty = {}.hasOwnProperty;
    for(var key in source) {
        if (hasOwnProperty.call(target, key)) {
            if (key === 'alias' || key === 'template') {
                for(var al in source[key]) {
                    target[key][al] = source[key][al];
                }
            } else {
                target[key] = source[key];
            }
        }
    }

    if (source['template']) {
        target.template.path = source.template.path ?
                                path.resolve(CWD, target.template.path) :
                                path.resolve(__dirname, '..', webpack, 'webpack');
        if (source.template.favicon) {
            target.template.favicon = path.resolve(CWD, source.base, source.template.favicon);
        }
    }

    // rewrite with local absolute path
    for(var key in target.alias) {
        var value = target.alias[key];
        target.alias[key] = path.join(target.base, value);
    }
    return target;
}

function isExists(filename) {
    return fs.existsSync(path.resolve(CWD, filename));
}

module.exports = {
    getConfig: function () {
        if (this.hasConfig()) {
            var filepath = path.resolve(CWD, 'v2rx.config.js');
            var config = require(filepath);
            return extend(defaultConfig, config);
        }
        return defaultConfig;
    },
    hasConfig: function () {
        return isExists('v2rx.config.js');
    }
};