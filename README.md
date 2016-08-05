# gulp-polymer-css-build [![Build Status](https://travis-ci.org/JohnRiv/gulp-polymer-css-build.svg?branch=master)](https://travis-ci.org/JohnRiv/gulp-polymer-css-build)

> Statically apply Polymer's CSS Mixin shim and CSS Custom Property shim (future work) with the [`Polymer CSS Builder`](https://github.com/PolymerLabs/polymer-css-build)


## Install

```
$ npm install --save-dev gulp-polymer-css-build
```

## Usage

### Single File with Shady DOM

```js
const gulp = require('gulp');
const vulcanize = require('gulp-vulcanize');
const polymerCssBuild = require('gulp-polymer-css-build');

gulp.task('default', () =>
    gulp.src('src/index.html')
        .pipe(vulcanize({
            abspath: '',
            excludes: [],
            stripExcludes: false
        }))
        .pipe(polymerCssBuild({
          'build-for-shady': true
        }))
        .pipe(gulp.dest('dest'))
);
```

### Single File with Shadow DOM

```js
const gulp = require('gulp');
const vulcanize = require('gulp-vulcanize');
const polymerCssBuild = require('gulp-polymer-css-build');

gulp.task('default', () =>
    gulp.src('src/index.html')
        .pipe(vulcanize({
            abspath: '',
            excludes: [],
            stripExcludes: false
        }))
        .pipe(polymerCssBuild())
        .pipe(gulp.dest('dest'))
);
```

### Multiple Files ([shards](https://github.com/Collaborne/gulp-web-component-shards)) with Shady DOM

```js
const gulp = require('gulp');
const wcs = require('gulp-web-component-shards');
const polymerCssBuild = require('gulp-polymer-css-build');

gulp.task('shards', () =>
  gulp.src('src/**/*.html', { base: 'src', read: false })
    .pipe(wcs({
      root: 'src'
    }))
    .pipe(polymerCssBuild({
      'build-for-shady': true
    }))
    .pipe(gulp.dest('dest'))
);
```

### Multiple Files ([shards](https://github.com/Collaborne/gulp-web-component-shards)) with Shadow DOM

```js
const gulp = require('gulp');
const wcs = require('gulp-web-component-shards');
const polymerCssBuild = require('gulp-polymer-css-build');

gulp.task('shards', () =>
  gulp.src('src/**/*.html', { base: 'src', read: false })
    .pipe(wcs({
      root: 'src'
    }))
    .pipe(polymerCssBuild())
    .pipe(gulp.dest('dest'))
);
```

## API

### PolymerCssBuild([options])

See the `polymer-css-build` [options](https://github.com/PolymerLabs/polymer-css-build#build-types-targeted-builds-and-polymer-dom-modes).


## License

MIT © [John Riviello](http://www.johnriviello.com)
