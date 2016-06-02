var memfs       =   require('mem-fs'),
    editor      =   require('mem-fs-editor'),
    path        =   require('path'),
    doc         =   require('./doc'),
    CWD         =   process.cwd(),
    store       =   memfs.create(),
    fs          =   editor.create(store);

function getPath(esmode, type, name) {
    
    // only allow es5 or es6
    var esmode = ((esmode + '').toLowerCase() === 'es5') ? 'es5': 'es6';

    return path.resolve(__dirname, esmode, type, name);
}

function upperClassName(name) {
    return name[0].toUpperCase() + name.slice(1);
}

/*
 * create componet under {config.components} fold
 *
 * 1. mkdir {name}
 * 2. create {name}/index.js
 * 3. create {name}/style.scss
 * 4. show some help info on exporting the component
 */
function createComponent(config, name) {

    var context = {
         name: name,
         css_modules: config.css_modules
    };

    var components_base = path.join(CWD, config.base, config.components, name);

    fs.copyTpl(getPath(config.esmode, 'component', 'index.js.ejs'), path.resolve(components_base, 'index.js'), context);
    fs.copyTpl(getPath(config.esmode, 'component', 'style.scss.ejs'), path.resolve(components_base, name.toLowerCase() + '.scss'), context);
    fs.commit(function(){
        console.log('component ' + name + ' created @' + config.components + '/ ' + name + ' \n');    

        console.log(doc[config.esmode]['component'](name));
    });
}

/*
 * create componet under {config.pages} fold
 *
 * 1. mkdir {name}
 * 2. create {name}/index.js
 * 3. create {name}/style.scss
 * 4. show some help info on how to config the router
 */
function createPage(config, name) {
    
    var context = {
         name: name,
         css_modules: config.css_modules
    };

    var page_base = path.join(CWD, config.base, config.pages, name);

    fs.copyTpl(getPath(config.esmode, 'page', 'index.js.ejs'), path.resolve(page_base, 'index.js'), context);
    fs.copyTpl(getPath(config.esmode, 'page', 'style.scss.ejs'), path.resolve(page_base, name.toLowerCase() + '.scss'), context);
    fs.commit(function(){
        console.log('page ' + name + ' created @' + config.pages + '/' + name + '\n');    

        console.log(doc[config.esmode]['page'](name));
    })
}

// /**
//  *  create an seed app powered by pepper
//  *
//  *  1. create scaffload router and app config
//  *  2. add in some pages
//  *  3. add in some component
//  *  4. run the demo
//  */
// function initApp(config, name) {
//     var context = {
//          name: name,
//          css_modules: config.css_modules
//     };

//     createComponent(config, 'MyComponent');
//     createPage(config, 'Hello');
// }

module.exports = {
    createComponent: createComponent,
    createPage : createPage
}
