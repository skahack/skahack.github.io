var debug = require('debug')('pages');
var fs = require('fs');
var write = fs.writeFileSync;
var metalsmith = require('metalsmith');
var templates = require('metalsmith-templates');
var markdown = require('metalsmith-markdown');
var draft = require('metalsmith-drafts');
var duo = require('duo')(__dirname);
var browserify = require('browserify')();
var less = require('duo-less');
var permalinks = require('metalsmith-permalinks');
var collections = require('metalsmith-collections');
var uglify = require('metalsmith-uglify');

global.moment = require('moment');
global.debug = debug;

module.exports = function(fn){
  var m = metalsmith(__dirname);
  m.metadata({
    site: {
      title: 'Mag | skahack',
      url: 'https://skahack.github.io/'
    }
  });
  m.use(draft());
  m.use(collections({
    lab: {
      pattern: 'labs/**',
      sortBy: 'created_at',
      reverse: true
    }
  }));
  m.use(permalinks({
    pattern: "lab/:slug/"
  }));
  m.use(markdown());
  m.use(templates({
    engine: 'jade',
    directory: 'templates'
  }));
  m.use(uglify());

  //
  // CSS
  //

  duo.entry('styles/index.less');
  duo.use(less());
  duo.cache(false);

  //
  // JavaScript
  //
  browserify.add('js/index.js');

  debug('build css...');
  duo.run(function(err, res){
    if (err) return fn(err);
    write('src/build.css', res.code);

    debug('build js...');
    browserify.bundle(function(err, res){
      if (err) return fn(err);
      write('src/build.js', res);

      debug('build metalsmith...');
      m.build(fn);
    });
  });
};
