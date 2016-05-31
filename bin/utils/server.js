require('shelljs/global');
var path        =   require('path'),
    express     =   require('express'),
    webpack     =   require('webpack'),
    fs          =   require('fs'),
    CWD         =   process.cwd(),
    DEV         =   require('../webpack/dev'),
    proxy       =   require('http-proxy-middleware'),
    Mock        =   require('mockjs');


module.exports.start = function (v2ex) {
   var config       = DEV(v2ex),
       app          = express(),
       is_start     = process.env.MODE == 'start',
       compiler     = webpack(config);


    is_start && app.use(require('webpack-dev-middleware')(compiler, {
      noInfo: false,
      publicPath: '/',
      stats: {
          colors: true,
          cached: false,
          exclude: [/node_modules[\\\/]/]
      }
    }));

    is_start && app.use(require('webpack-hot-middleware')(compiler));

    // Mock Server
    var mockconfig_path = path.resolve(CWD, 'mock.js');
    if( fs.existsSync(mockconfig_path) ) {

        var data = require(path.resolve(CWD, 'mock.js'));
        if( !Array.isArray(data) ) {
            console.error('mock config data must be an array like these: \n');
        } else {

            data.map(function(item) {
                if( item.proxy ) {
                    app.use(proxy(item.path, {
                        target: item.proxy,
                        changeOrigin: item.changeOrigin !== false,
                        ws: item.ws !== false,
                        pathRewrite: item.pathRewrite
                    }));
                } else {
                    var method = item.method || 'get';
                    app[method](item.path, function(req, res) {
                        var data = Mock.mock(item.data);
                        res.send(data);
                    });
                }
            });

        }
    }

    app.use(express.static(path.resolve(CWD, v2ex.build)))

    app.get('*', function(req, res, next) {
      var filename = path.join(compiler.outputPath, 'index.html');
      compiler.outputFileSystem.readFile(filename, function(err, result){
        if (err) {
          return next(err);
        }
        res.set('content-type','text/html');
        res.send(result);
        res.end();
      });
      // res.sendFile(path.resolve(CWD, v2ex.build, 'index.html'));
    });

    app.listen(v2ex.port, v2ex.host, function(err) {
      if (err) {
        console.log(err);
        return;
      }

      console.log('🌎  Listening at http://' + v2ex.host + ':' + v2ex.port);
      exec('open http://' + v2ex.host + ':' + v2ex.port);
    });
}
