'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var polymerCssBuild = require('polymer-css-build').polymerCssBuild;

/**
 * @typedef Config
 * @property {boolean} build-for-shady if true then build for ShadyDOM instead of ShadowDOM
 */

/**
 * @param {Config} [opts] the configuration
 */
module.exports = function (opts) {

  return through.obj(function (file, enc, cb) {

    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new gutil.PluginError('gulp-polymer-css-build', 'Streaming not supported'));
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
      return cb(new gutil.PluginError('polymer-css-build', e));
    }

  });

};
