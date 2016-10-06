var bases, path, minify, path, opts, images_options, browser_support, gulp, $, browserSync, del, reload;

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
  img: 'assets/img',
  scss: 'assets/scss',
  js: 'assets/js',
  css: 'assets/css',
  fonts: 'assets/fonts',
  refresh: [bases.src + '/' + '**/*.html', bases.src + '/' + '**/*.php']
};

opts = {
  notify: false,
  open: true,
  files: [bases.src + '/' + path.refresh]
};

images_options = {
  imageMin: {
    optimizationLevel: 3,
    progressive: true,
    interlaced: true
  }
};

minify = true;

browser_support = ['ie >= 8', 'last 3 versions'];

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
 *   `gulp prod`
 * ======================================================================== */

// images
gulp.task('images', function() {
  return gulp.src([
    bases.src + '/' + path.img + '/**/*',
    '!' + bases.src + '/' + path.img + 'vectors/**/*'])
    .pipe($.plumber())
    .pipe($.changed(bases.dist + '/' + path.img))
    .pipe($.imagemin(images_options))
    .pipe(gulp.dest(bases.dist + '/' + path.img + '/'));
})

// copy bootstrap required fonts
gulp.task('fonts', function() {
  return gulp.src(path.bootstrap_sass + '/assets/fonts/**/*')
    .pipe(gulp.dest(bases.src + '/' + path.fonts));
});

// make a bootstrap file
gulp.task('bootstrap', gulp.series('fonts', function() {
  return gulp.src(bases.src + '/' + path.scss + '/vendor/*.scss')
    .pipe($.plumber())
    .pipe($.sass({
      includePaths: [path.bootstrap_sass + '/assets/stylesheets']
    }).on('error', $.sass.logError))
    .pipe($.rename('bootstrap.css'))
    .pipe(gulp.dest(bases.src + '/' + path.css + '/vendor'))
    .pipe($.size())
}));

// compile scss
gulp.task('styles', gulp.series('bootstrap', function() {
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
    }));
}));

gulp.task('min', gulp.series('styles', function() {
  return gulp.src([bases.src + '/' + path.css + '/vendor/*.css'], [bases.src + '/' + path.css + '/main.css'])
    .pipe($.plumber())
    .pipe(minify ? $.concat('main.min.css') : {})
    .pipe(minify ? $.cssnano() : {})
    .pipe(gulp.dest(bases.src + '/' + path.css + '/'));
}))

gulp.task('min-js', gulp.series('bootstrap', function() {
  return gulp.src([bases.src + '/' + path.js + '/lib/jquery.min.js'], [bases.src + '/' + path.js + '/lib/bootstrap.min.js'], [bases.src + '/' + path.js + '/main.js'])
    .pipe($.plumber())
    .pipe(minify ? $.concat('main.min.js') : {})
    .pipe(gulp.dest(bases.src + '/' + path.js + '/'));
}))

// Clean folder dist
gulp.task('clean', function() {
  return del([bases.dist]);
});

// Copy files into dist
gulp.task('copy', gulp.series('clean', function() {
  return gulp.src([
    bases.src + '/**',
    '!' + bases.src + '/' + path.scss + '{,/**}',
    '!' + bases.src + '/' + path.css + '{,/*.map}'], {
      dot: true
    })
  .pipe($.plumber())
  .pipe(gulp.dest(bases.dist))
  .pipe($.size());
}));

gulp.task('watch', function() {
  if (path.proxy) {
    opts.proxy = path.proxy;
  } else {
    opts.server = {
      baseDir: path.server + '/' + bases.src
    };
  }
  browserSync(opts);

  gulp.watch([bases.src + '/' + path.scss + '/**/*'], gulp.series('styles'));
  //gulp.watch([bases.src + 'scripts/**/*'], ['jshint', 'scripts']);
})

gulp.task('default', gulp.series('watch', function() {}));
gulp.task('prod', gulp.series('clean', 'min', 'min-js', 'copy', 'images'));