var sass,
  min,
  bases,
  path,
  opts,
  gulp,
  $,
  browserSync,
  postcss,
  autoprefixer,
  del,
  attrsSorter,
  posthtmlConfig,
  reload;

/* ========================================================================
 *
 * Configuration
 * ======================================================================== */

sass = require("gulp-sass")(require("sass"));
gulp = require("gulp");
$ = require("gulp-load-plugins")();
browserSync = require("browser-sync");
postcss = require("gulp-postcss");
autoprefixer = require("autoprefixer");
attrsSorter = require("posthtml-attrs-sorter");
del = require("del");
reload = browserSync.reload;

min = true;

bases = {
  src: "src",
  dist: "dist",
};

path = {
  // proxy: 'local.dev/my/server/lol',
  bootstrap_sass: "assets/scss/vendor/bootstrap",
  server: "./",
  img: "assets/img",
  scss: "assets/scss",
  js: "assets/js",
  css: "assets/css",
  fonts: "assets/fonts",
  refresh: [
    bases.src + "/" + "assets/js" + "/**/*.js",
    bases.src + "/" + "**/*.html",
    bases.src + "/" + "**/*.php",
  ],
};

opts = {
  notify: false,
  open: true,
  files: [bases.src + "/" + path.refresh],
};

posthtmlConfig = {
  plugins: [
    attrsSorter({
      order: [
        "class",
        "id",
        "name",
        "data",
        "ng",
        "src",
        "for",
        "type",
        "href",
        "values",
        "title",
        "alt",
        "role",
        "aria",
      ],
    }),
  ],
  options: {},
};

// clean html
gulp.task("html", function () {
  return gulp
    .src(bases.src + "/" + "**/*.html")
    .pipe($.plumber())
    .pipe($.posthtml(posthtmlConfig.plugins, posthtmlConfig.options))
    .pipe(gulp.dest(bases.src));
});

// make a bootstrap file
gulp.task("bootstrap", function () {
  return gulp
    .src(bases.src + "/" + path.bootstrap_sass + "/**/*.scss")
    .pipe($.plumber())
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest(bases.src + "/" + path.css + "/vendor"));
});

// compile scss
gulp.task("styles", function () {
  return gulp
    .src(bases.src + "/" + path.scss + "/*.scss")
    .pipe($.plumber())
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest(bases.src + "/" + path.css + "/"))
    .pipe(
      reload({
        stream: true,
      })
    );
});

// Minify css
gulp.task("min-css", function () {
  return gulp
    .src([
      bases.src + "/" + path.css + "/vendor/bootstrap.css",
      bases.src + "/" + path.css + "/main.css",
    ])
    .pipe($.plumber())
    .pipe($.concat("main.css"))
    .pipe(gulp.dest(bases.dist + "/" + path.css + "/"))
    .pipe($.if(min, $.rename("all.min.css")))
    .pipe(
      $.if(
        min,
        $.cssnano({
          discardComments: {
            removeAll: true,
          },
        })
      )
    )
    .pipe($.if(min, gulp.dest(bases.dist + "/" + path.css + "/")));
});

// Minify js
gulp.task("min-js", function () {
  return gulp
    .src([
      // bases.src + '/' + path.js + '/lib/YOURJS.js',
      bases.src + "/" + path.js + "/main.js",
    ])
    .pipe($.plumber())
    .pipe($.concat("main.js"))
    .pipe(gulp.dest(bases.dist + "/" + path.js + "/"))
    .pipe($.if(min, $.rename("all.min.js")))
    .pipe($.if(min, $.uglify()))
    .pipe($.if(min, gulp.dest(bases.dist + "/" + path.js + "/")));
});

// Clean folder dist
gulp.task("clean", function () {
  return del([bases.dist]);
});

// Copy files into dist
gulp.task("copy", function () {
  return gulp
    .src([
      bases.src + "/**/*.html",
      bases.src + "/favicon.ico",
      bases.src + "/robots.txt",
      bases.src + "/manifest.webmanifest",
    ])
    .pipe($.plumber())
    .pipe(gulp.dest(bases.dist));
});

gulp.task("watch", function () {
  if (path.proxy) {
    opts.proxy = path.proxy;
  } else {
    opts.server = {
      baseDir: path.server + "/" + bases.src,
    };
  }
  browserSync(opts);

  gulp.watch(
    [bases.src + "/" + path.scss + "/**/*.scss"],
    gulp.series("styles")
  );
  return $.watch(path.refresh, reload);
});

gulp.task(
  "default",
  gulp.series("bootstrap", "html", "watch", function () {})
);
gulp.task(
  "prod",
  gulp.series(
    "clean",
    "bootstrap",
    "styles",
    "html",
    "copy",
    gulp.parallel("min-css", "min-js")
  )
);
