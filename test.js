/* eslint-env mocha */
'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var vulcanize = require('gulp-vulcanize');
var wcs = require('gulp-web-component-shards');
var polymerCssBuild = require('./');

function copyTestFile(src, dest) {
  fs.writeFileSync(dest, fs.readFileSync(src, 'utf8'));
}

describe('gulp-polymer-css-build', function () {

  before(function () {
    rimraf.sync('tmp');
    mkdirp.sync('tmp/single');
    mkdirp.sync('tmp/multiple');
  });

  describe('processing a single file', function () {

    var fileToTest;

    before(function (done) {

      var stream;

      copyTestFile('fixture/index.html', path.join('tmp', 'single', 'index.html'));
      copyTestFile('fixture/shared-styles.html', path.join('tmp', 'single', 'shared-styles.html'));
      copyTestFile('fixture/x-import.html', path.join('tmp', 'single', 'x-import.html'));

      stream = vulcanize();

      stream.on('data', function (file) {
        fs.writeFileSync(path.join('tmp', 'single', 'vulcanize.html'), file.contents);
      });

      stream.on('end', function() {
        fileToTest = {
          cwd: __dirname,
          base: path.join(__dirname, 'tmp', 'single'),
          path: path.join('tmp', 'single', 'vulcanize.html'),
          contents: fs.readFileSync(path.join('tmp', 'single', 'vulcanize.html'))
        };
        done();
      });

      stream.write(new gutil.File({
        cwd: __dirname,
        base: path.join(__dirname, 'tmp', 'single'),
        path: path.join('tmp', 'single', 'index.html'),
        contents: fs.readFileSync(path.join('tmp', 'single', 'index.html'))
      }));

      stream.end();

    });

    it('with default options ({"build-for-shady": false})', function (done) {

      var stream = polymerCssBuild();

      stream.on('data', function (file) {
        var contents = file.contents.toString();
        assert.ok(/css-build="shadow"/.test(contents));
        assert.ok(/<style scope="x-import">/.test(contents));
      });

      stream.on('end', done);

      stream.write(new gutil.File(fileToTest));

      stream.end();

    });

    // Not exactly sure why, but once we call polymerCssBuild with the
    // {'build-for-shady': true} option, there seems to be no way to undo that
    // Leaving this as pending for now.
    xit('with the build-for-shady option', function (done) {

      var stream = polymerCssBuild({'build-for-shady': true});

      stream.on('data', function (file) {
        var contents = file.contents.toString();
        assert.ok(/css-build="shady"/.test(contents));
        assert.ok(/<template class="style-scope x-import">/.test(contents));
        assert.ok(/<style scope="x-import">/.test(contents));
        assert.ok(/<content class="style-scope x-import">/.test(contents));
      });

      stream.on('end', done);

      stream.write(new gutil.File(fileToTest));

      stream.end();

    });

  });

  describe('processing multiple files (shards)', function () {

    var wcsFiles = [],
        createVinyl = function (relPath) {
          var cwd = process.cwd();
          return new gutil.File({
            cwd: cwd,
            base: path.join(cwd, path.dirname(relPath)),
            path: path.join(cwd, relPath),
            contents: new Buffer(fs.readFileSync(relPath))
          });
        };

    before(function (done) {

      var stream,
          srcFiles = [];

      copyTestFile('fixture/index.html', path.join('tmp', 'multiple', 'index.html'));
      copyTestFile('fixture/page.html', path.join('tmp', 'multiple', 'page.html'));
      copyTestFile('fixture/shared-styles.html', path.join('tmp', 'multiple', 'shared-styles.html'));
      copyTestFile('fixture/x-import.html', path.join('tmp', 'multiple', 'x-import.html'));
      copyTestFile('fixture/y-import.html', path.join('tmp', 'multiple', 'y-import.html'));

      srcFiles.push(createVinyl('tmp/multiple/index.html'));
      srcFiles.push(createVinyl('tmp/multiple/page.html'));
      srcFiles.push(createVinyl('tmp/multiple/shared-styles.html'));
      srcFiles.push(createVinyl('tmp/multiple/x-import.html'));
      srcFiles.push(createVinyl('tmp/multiple/y-import.html'));

      stream = wcs({
        root: 'tmp/multiple',
        work: 'tmp/multiple'
      });

      stream.on('data', function (file) {
        fs.writeFileSync(file.path, file.contents);
        if(file.path.endsWith("index.html") ||
           file.path.endsWith("page.html") ||
           file.path.endsWith("shared.html")) {
          wcsFiles.push(file);
        }
      });

      stream.on('end', done);

      srcFiles.forEach(function (file) {
        stream.write(file);
      });

      stream.end();

    });

    it('with default options ({"build-for-shady": false})', function (done) {

      var stream = polymerCssBuild();

      stream.on('data', function (file) {
        var contents = file.contents.toString();

        if (file.path.endsWith("index.html")) {
          assert.ok(/css-build="shadow"/.test(contents));
          assert.ok(/<style scope="x-import">/.test(contents));
        } else if (file.path.endsWith("page.html")) {
          assert.ok(/css-build="shadow"/.test(contents));
          assert.ok(/<style scope="y-import">/.test(contents));
        } else if (file.path.endsWith("shared.html")) {
          assert.ok(/css-build="shadow"/.test(contents));
          assert.ok(/<style scope="shared-styles">/.test(contents));
        }
      });

      stream.on('end', function() {
        done();
      });

      wcsFiles.forEach(function (file) {
        stream.write(new gutil.File(file));
      });

      stream.end();

    });

    it('with the build-for-shady option', function (done) {

      var stream = polymerCssBuild({'build-for-shady': true});

      stream.on('data', function (file) {
        var contents = file.contents.toString();

        if (file.path.endsWith("index.html")) {
          assert.ok(/css-build="shady"/.test(contents));
          assert.ok(/<template class="style-scope x-import">/.test(contents));
          assert.ok(/<style scope="x-import">/.test(contents));
          assert.ok(/<p class="x style-scope x-import">/.test(contents));
          assert.ok(/<content class="style-scope x-import">/.test(contents));
        } else if (file.path.endsWith("page.html")) {
          assert.ok(/css-build="shady"/.test(contents));
          assert.ok(/<template class="style-scope y-import">/.test(contents));
          assert.ok(/<style scope="y-import">/.test(contents));
          assert.ok(/<p class="y style-scope y-import">/.test(contents));
          assert.ok(/<content class="style-scope y-import">/.test(contents));
        } else if (file.path.endsWith("shared.html")) {
          assert.ok(/css-build="shady"/.test(contents));
          assert.ok(/<template class="style-scope shared-styles">/.test(contents));
          assert.ok(/<style scope="shared-styles">/.test(contents));
        }
      });

      stream.on('end', function() {
        done();
      });

      wcsFiles.forEach(function (file) {
        stream.write(new gutil.File(file));
      });

      stream.end();

    });

  });

});
