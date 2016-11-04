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
  const inputDocs = [];

  const stream = through.obj(function (file, enc, cb) {

    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new gutil.PluginError('gulp-polymer-css-build', 'Streaming not supported'));
    }

    inputDocs.push({
      url: file.path,
      // XXX: Can we provide the buffer directly?
      content: file.contents.toString('utf8'),
      file: file
    });

    // All is fine, we'll push out the files later on.
    return cb(null);
  }, function (cb) {
    try {
      return polymerCssBuild(inputDocs, opts).then(function(polyCssBuiltFiles) {
        polyCssBuiltFiles.forEach(function(polyCssBuiltFile, index) {
          const file = inputDocs[index].file;
          file.contents = new Buffer(polyCssBuiltFile.content);
          stream.push(file);
        });
      }).then(function() {
        cb(null);
      });
    } catch (e) {
      return cb(new gutil.PluginError('polymer-css-build', e));
    }

  });

  return stream;
};
