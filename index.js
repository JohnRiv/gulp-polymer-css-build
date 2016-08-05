'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var polymerCssBuild = require('polymer-css-build').polymerCssBuild;

module.exports = function (opts) {

  return through.obj(function (file, enc, cb) {

    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('gulp-polymer-css-build', 'Streaming not supported'));
      return;
    }

    try {
      polymerCssBuild([{
        url: file.path,
        content: String(file.contents)
      }], opts).then(function(polyCssBuiltFiles) {
        file.contents = new Buffer(polyCssBuiltFiles[0].content);
        cb(null, file);
      });
    } catch (e) {
      cb(new gutil.PluginError('polymer-css-build', e));
      return;
    }

  });

};
