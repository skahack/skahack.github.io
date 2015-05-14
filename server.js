var debug = require('debug')('server');
var build = require('./build');
var express = require('express');
var path = require('path');

var app = express();

app.use(function (req, res, next) {
  console.log('Time:', Date.now());
  next();
});

app.use(builder);

app.use(express.static(path.join(__dirname, 'build')));

app.listen(process.env.PORT, function(){
  console.log('Server running at http://localhost:' + process.env.PORT + '');
});

function builder(req, res, next) {
  if (req.path !== '/') return next();
  build(function(err){
    if (err) return next(err);
    debug('Built');
    next();
  });
}
