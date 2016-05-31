var inquirer    =   require('inquirer'),
    fs          =   require('fs'),
    path        =   require('path'),
    task        =   require('./task'),
    CWD         =   process.cwd();

function isExists(name) {
   return fs.existsSync(path.resolve(CWD, name));
}

var tasks = {
    "upgrade": function() {
        task.upgrade();
    },
    "start": function() {
        task.start();
    },
    "build": function() {
        var modes = {
            'test': task.test,
            'pre': task.pre,
            'release': task.release,
            'cancel': show_help
        };
        inquirer.prompt([{
            type: 'list',
            name: 'pack',
            message: '请选择打包环境 : ',
            choices: [{
                name: 'test 环境',
                value: 'test'
            }, {
                name: 'pre 环境',
                value: 'pre'
            }, {
                name: 'release 环境',
                value: 'release'
            }]
        }], function(answers){
            modes[answers.pack]();
        })
    }
};

var options = [{
    type: "list",
    name: "task",
    message: "选择要执行的任务: ",
    choices: [{
        name: '项目打包',
        value: 'build'
    }, {
        name: '开发调试',
        value: 'start'
    }, {
        name: '升级v2ex',
        value: 'upgrade'
    }]
}]

function show_help() {
    inquirer.prompt(options, function( answers ) {
        tasks[answers.task]();
    });
}

module.exports = {
    help: show_help
};


