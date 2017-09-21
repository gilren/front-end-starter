var min,
  bases,
  path,
  opts,
  imagesOptions,
  browserSupport,
  gulp,
  $,
  browserSync,
  del,
  attrsSorter,
  posthtmlConfig,
  reload

/* ========================================================================
 *
 * Configuration
 * ======================================================================== */

gulp = require('gulp')
$ = require('gulp-load-plugins')()
browserSync = require('browser-sync')
attrsSorter = require('posthtml-attrs-sorter')
del = require('del')
reload = browserSync.reload

min = true

bases = {
  src: 'src',
  dist: 'dist'
}

path = {
  // proxy: 'local.dev/my/server/lol',
  bootstrap_sass: 'assets/scss/vendor/bootstrap',
  server: './',
  img: 'assets/img',
  scss: 'assets/scss',
  js: 'assets/js',
  css: 'assets/css',
  fonts: 'assets/fonts',
  refresh: [
    bases.src + '/' + 'assets/js' + '/**/*.js',
    bases.src + '/' + '**/*.html',
    bases.src + '/' + '**/*.php'
  ]
}

opts = {
  notify: false,
  open: true,
  files: [bases.src + '/' + path.refresh]
}

imagesOptions = {
  imageMin: {
    optimizationLevel: 3,
    progressive: true,
    interlaced: true
  }
}

posthtmlConfig = {
  plugins: [
    attrsSorter({
      order: [
        'class',
        'id',
        'name',
        'data',
        'ng',
        'src',
        'for',
        'type',
        'href',
        'values',
        'title',
        'alt',
        'role',
        'aria'
      ]
    })
  ],
  options: {}
}

browserSupport = ['ie >= 11', 'last 2 versions']

/* ========================================================================
 *
 * Tasks
 * Available tasks:
 *   `gulp`
 *   `gulp min`
 *   `gulp prod`
 *   `gulp copy-bootstrap`
 *   `gulp bootstrap`
 *   `gulp clean`
 * ======================================================================== */

// clean html
gulp.task('html', function () {
  return gulp
    .src(bases.src + '/' + '**/*.html')
    .pipe($.plumber())
    .pipe($.posthtml(posthtmlConfig.plugins, posthtmlConfig.options))
    .pipe(gulp.dest(bases.src))
})

// make a bootstrap file
gulp.task('bootstrap', function () {
  return gulp
    .src(bases.src + '/' + path.bootstrap_sass + '/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(bases.src + '/' + path.css + '/vendor'))
})

gulp.task('concat-variables', function () {
  return gulp
    .src([
      bases.src + '/' + path.scss + '/base/_variables.scss',
      bases.src + '/' + path.scss + '/base/_mixins.scss'
    ])
    .pipe($.plumber())
    .pipe($.concat('_variables.scss'))
    .pipe(gulp.dest(bases.src + '/' + path.scss + '/concat'))
})

gulp.task('concat-common', function () {
  return gulp
    .src([
      bases.src + '/' + path.scss + '/base/_import.scss',
      bases.src + '/' + path.scss + '/layout/_utils.scss',
      bases.src + '/' + path.scss + '/layout/_header.scss',
      bases.src + '/' + path.scss + '/layout/_sidebar.scss',
      bases.src + '/' + path.scss + '/layout/_footer.scss',
      bases.src + '/' + path.scss + '/components/*.scss'
    ])
    .pipe($.plumber())
    .pipe($.concat('common.scss'))
    .pipe(gulp.dest(bases.src + '/' + path.scss + '/concat'))
})

gulp.task('concat-page', function () {
  return gulp
    .src([
      bases.src + '/' + path.scss + '/base/_import.scss',
      bases.src + '/' + path.scss + '/pages/*.scss',
      '!' + bases.src + '/' + path.scss + '/pages/_home.scss'
    ])
    .pipe($.plumber())
    .pipe($.concat('page.scss'))
    .pipe(gulp.dest(bases.src + '/' + path.scss + '/concat'))
})

gulp.task('concat-home', function () {
  return gulp
    .src([
      bases.src + '/' + path.scss + '/base/_import.scss',
      bases.src + '/' + path.scss + '/pages/_home.scss'
    ])
    .pipe($.plumber())
    .pipe($.concat('home.scss'))
    .pipe(gulp.dest(bases.src + '/' + path.scss + '/concat'))
})

// compile scss
gulp.task('styles', function () {
  return gulp
    .src(bases.src + '/' + path.scss + '/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe(
      $.autoprefixer({
        browsers: browserSupport
      })
    )
    .pipe($.combineMq())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(bases.src + '/' + path.css + '/'))
    .pipe(
      reload({
        stream: true
      })
    )
})

// Minify css
gulp.task('min-css', function () {
  return gulp
    .src([
      bases.src + '/' + path.css + '/vendor/bootstrap.css',
      bases.src + '/' + path.css + '/main.css'
    ])
    .pipe($.plumber())
    .pipe($.concat('main.css'))
    .pipe(gulp.dest(bases.dist + '/' + path.css + '/'))
    .pipe($.if(min, $.rename('all.min.css')))
    .pipe(
      $.if(
        min,
        $.cssnano({
          discardComments: {
            removeAll: true
          }
        })
      )
    )
    .pipe($.if(min, gulp.dest(bases.dist + '/' + path.css + '/')))
})

// Minify js
gulp.task('min-js', function () {
  return gulp
    .src([
      // bases.src + '/' + path.js + '/lib/YOURJS.js',
      bases.src + '/' + path.js + '/main.js'
    ])
    .pipe($.plumber())
    .pipe($.concat('main.js'))
    .pipe(gulp.dest(bases.dist + '/' + path.js + '/'))
    .pipe($.if(min, $.rename('all.min.js')))
    .pipe(
      $.if(
        min,
        $.uglify({
          preserveComments: 'none'
        })
      )
    )
    .pipe($.if(min, gulp.dest(bases.dist + '/' + path.js + '/')))
})

// minify images
gulp.task('images', function () {
  return gulp
    .src([bases.src + '/' + path.img + '/**/*'])
    .pipe($.plumber())
    .pipe($.changed(bases.dist + '/' + path.img))
    .pipe($.imagemin(imagesOptions))
    .pipe(gulp.dest(bases.dist + '/' + path.img + '/'))
})

// Clean folder dist
gulp.task('clean', function () {
  return del([bases.dist])
})

// Copy files into dist
gulp.task('copy', function () {
  return gulp
    .src([
      bases.src + '/**/*.html',
      bases.src + '/favicon.ico',
      bases.src + '/robots.txt'
    ])
    .pipe($.plumber())
    .pipe(gulp.dest(bases.dist))
})

gulp.task('watch', function () {
  if (path.proxy) {
    opts.proxy = path.proxy
  } else {
    opts.server = {
      baseDir: path.server + '/' + bases.src
    }
  }
  browserSync(opts)

  gulp.watch(
    [bases.src + '/' + path.scss + '/**/*.scss'],
    gulp.series('bootstrap', 'styles')
  )
  return $.watch(path.refresh, reload)
})

gulp.task('default', gulp.series('html', 'watch', function () {}))
gulp.task(
  'concat',
  gulp.series('concat-variables', 'concat-common', 'concat-home', 'concat-page')
)
gulp.task(
  'prod',
  gulp.series(
    'clean',
    'bootstrap',
    'styles',
    'html',
    'concat',
    'copy',
    // gulp.parallel('min-css', 'min-js'),
    'images'
  )
)
