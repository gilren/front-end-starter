var options, bases, path, browser_support, gulp, $, browserSync, notify, del, reload;

/* ========================================================================
 *
 * Configuration
 * ======================================================================== */

bases = {
  src: 'src',
  dist: 'dist'
};

path = {
  //proxy: 'local.dev/my/server/lol',
  bootstrap_sass: './bower_components/bootstrap-sass',
  server: './',
  scss: 'assets/scss',
  js: 'assets/js',
  css: 'assets/css',
  fonts: 'assets/fonts',
  refresh: [bases.src + '/' + '**/*.html', bases.src + '/' + '**/*.php', bases.src + '/' + 'assets/js' + '/' + '**/*.js']
};

browser_support = ['last 2 versions'];

gulp = require('gulp');
$ = require('gulp-load-plugins')();
browserSync = require('browser-sync');
del = require('del');
reload = browserSync.reload;

/* ========================================================================
 *
 * Tasks
 * Available tasks:
 *   `gulp`
 *   `gulp watch`
 * ======================================================================== */

gulp.task('default', ['compile'], function() {

  var opts;
  opts = {
    notify: false,
    open: true
  };
  if (path.proxy) {
    opts.proxy = path.proxy;
  } else {
    opts.server = {
      baseDir: path.server + '/' + bases.src
    };
  }
  browserSync(opts);
  $.watch(bases.src + '/' + path.scss + '/**/*.scss', function() {
    return gulp.start('scss');
  });
  return $.watch(path.refresh, reload);
});

// dev task
// compile scss
gulp.task('compile', ['scss']);

// delete dist folder, run dev task, copy files into dist
gulp.task('prod', ['clean', 'compile', 'copy'], function() {
  var opts;
  opts = {
    notify: false,
    open: true
  };
  if (path.boot) {
    opts.proxy = path.proxy;
  } else {
    opts.server = {
      baseDir: path.server + '/' + bases.dist
    };
  }
  browserSync(opts);
});

// copy bootstrap required fonts
gulp.task('fonts', function() {
  return gulp
    .src(path.bootstrap_sass + '/assets/fonts/**/*')
    .pipe(gulp.dest(bases.src + '/' + path.fonts));
});

// make a bootstrap file
gulp.task('bootstrap', ['fonts'], function() {
  return gulp.src(bases.src + '/' + path.scss + '/vendor/*.scss')
    .pipe($.plumber())
    .pipe($.sass({
      includePaths: [path.bootstrap_sass + '/assets/stylesheets']
    }).on('error', $.sass.logError))
    .pipe($.rename('bootstrap.css'))
    .pipe(gulp.dest(bases.src + '/' + path.css + '/vendor'))
    .pipe($.size())
});

// compile scss
gulp.task('scss', ['bootstrap'], function() {
  return gulp.src([bases.src + '/' + path.scss + '/*.scss', bases.src + '/' + path.scss + '/pages/*.scss'])
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
    }));
});

// Clean folder dist
gulp.task('clean', function() {
  return del([bases.dist]);
});

// Copy files into dist
gulp.task('copy', ['clean'], function() {
  return gulp.src(
      [
        bases.src + '/**',
        '!' + bases.src + '/' + path.scss + '{,/**}'
      ], {
        dot: true
      })
    .pipe($.plumber())
    .pipe(gulp.dest(bases.dist))
    .pipe($.size());
});