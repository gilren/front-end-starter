var min, bases, path, minify, path, opts, images_options, browser_support, gulp, $, browserSync, del, reload

/* ========================================================================
 *
 * Configuration
 * ======================================================================== */

min = true

bases = {
  src: 'src',
  dist: 'dist'
}

path = {
  //proxy: 'local.dev/my/server/lol',
  bootstrap_sass: './bower_components/bootstrap-sass',
  server: './',
  img: 'assets/img',
  scss: 'assets/scss',
  js: 'assets/js',
  css: 'assets/css',
  fonts: 'assets/fonts',
  refresh: [bases.src + '/' + 'assets/js' + '/**/*.js', bases.src + '/' + '**/*.html', bases.src + '/' + '**/*.php']
}

opts = {
  notify: false,
  open: true,
  files: [bases.src + '/' + path.refresh]
}

images_options = {
  imageMin: {
    optimizationLevel: 3,
    progressive: true,
    interlaced: true
  }
}

browser_support = ['ie >= 9', 'last 3 versions']

gulp = require('gulp')
$ = require('gulp-load-plugins')()
browserSync = require('browser-sync')
del = require('del')
reload = browserSync.reload

/* ========================================================================
 *
 * Tasks
 * Available tasks:
 *   `gulp`
 *   `gulp prod`
 *   `gulp min-css`
 *   `gulp min-js`
 *   `gulp clean`
 *   `gulp copy`
 * ======================================================================== */


// images
gulp.task('images', function() {
  return gulp.src([
    bases.src + '/' + path.img + '/**/*',
    '!' + bases.src + '/' + path.img + 'vectors/**/*'])
    .pipe($.plumber())
    .pipe($.changed(bases.dist + '/' + path.img))
    .pipe($.imagemin(images_options))
    .pipe(gulp.dest(bases.dist + '/' + path.img + '/'))
    .pipe($.size())
})

// copy bootstrap required fonts
gulp.task('fonts', function() {
  return gulp.src(path.bootstrap_sass + '/assets/fonts/**/*')
    .pipe(gulp.dest(bases.src + '/' + path.fonts))
    .pipe($.size())
})

// make a bootstrap file
gulp.task('bootstrap', function() {
  return gulp.src(bases.src + '/' + path.scss + '/vendor/*.scss')
    .pipe($.plumber())
    .pipe($.sass({
      includePaths: [path.bootstrap_sass + '/assets/stylesheets']
    }).on('error', $.sass.logError))
    .pipe($.rename('bootstrap.css'))
    .pipe(gulp.dest(bases.src + '/' + path.css + '/vendor'))
    .pipe($.size())
})

// compile scss
gulp.task('styles', function() {
  return gulp.src([bases.src + '/' + path.scss + '/*.scss'])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: browser_support
    }))
    .pipe($.combineMq())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(bases.src + '/' + path.css + '/'))
    .pipe($.size())
    .pipe(reload({
      stream: true
    }))
})

// Minify css
gulp.task('min-css', function() {
  return gulp.src([
    bases.src + '/' + path.css + '/vendor/bootstrap.css',
    bases.src + '/' + path.css + '/main.css'
  ])
    .pipe($.plumber())
    .pipe($.concat('main.css'))
    .pipe(gulp.dest(bases.dist + '/' + path.css + '/'))
    .pipe($.if(min, $.rename('all.min.css')))
    .pipe($.if(min, $.cssnano({
      discardComments: {removeAll: true}
    })))
    .pipe($.if(min, gulp.dest(bases.dist + '/' + path.css + '/')))
    .pipe($.size())
})

// Minify js
gulp.task('min-js', function() {
  return gulp.src([
  //bases.src + '/' + path.js + '/lib/YOURJS.js',
    bases.src + '/' + path.js + '/main.js'
  ])
    .pipe($.plumber())
    .pipe($.concat('main.js'))
    .pipe(gulp.dest(bases.dist + '/' + path.js + '/'))
    .pipe($.if(min, $.rename('all.min.js')))
    .pipe($.if(min, $.uglify({preserveComments: 'none'})))
    .pipe($.if(min, gulp.dest(bases.dist + '/' + path.js + '/')))
    .pipe($.size())
})

// Clean folder dist
gulp.task('clean', function() {
  return del([bases.dist])
})

// Copy files into dist
gulp.task('copy', function() {
  return gulp.src([
    bases.src + '/**',
    '!' + bases.src + '/' + path.js,
    '!' + bases.src + '/' + path.js + '/**',
    '!' + bases.src + '/' + path.scss,
    '!' + bases.src + '/' + path.scss + '/**',
    '!' + bases.src + '/' + path.css,
    '!' + bases.src + '/' + path.css + '/**'])
  .pipe($.plumber())
  .pipe(gulp.dest(bases.dist))
  .pipe($.size())
})

gulp.task('watch', function() {
  if (path.proxy) {
    opts.proxy = path.proxy
  } else {
    opts.server = {
      baseDir: path.server + '/' + bases.src
    }
  }
  browserSync(opts)

  gulp.watch([bases.src + '/' + path.scss + '/**/*'], gulp.series('fonts', 'bootstrap', 'styles'))
  return $.watch(path.refresh, reload);
})

gulp.task('default', gulp.series('watch', function() {}))
gulp.task('prod', gulp.series('clean', gulp.parallel('fonts', 'bootstrap') , 'styles' , 'copy', gulp.parallel('min-css', 'min-js'), 'images'))
