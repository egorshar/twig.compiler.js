var gulp = require('gulp'),
    concat = require('gulp-concat'),
    wrap = require("gulp-wrap"),
    scripts = [
      __dirname + '/src/twig.compiler.helpers.js',
      __dirname + '/src/twig.compiler.expression.js',
      __dirname + '/src/twig.compiler.operator.js',
      __dirname + '/src/twig.compiler.logic.js',
      __dirname + '/src/twig.compiler.js'
    ];

gulp.task('default', ['js']);

gulp.task('js', function() {
  return gulp.src(scripts)
    .pipe(concat('twig.compiler.js'))
    .pipe(gulp.dest('./'))
});

gulp.task('node', function() {
  return gulp.src(scripts)
    .pipe(concat('twig.compiler.js'))
    .pipe(wrap('module.exports = function (Twig) {\n<%= contents %>\nreturn Twig\n}'))
    .pipe(gulp.dest('./'))
});

gulp.task('_twig', function() {
  return gulp.src([
      __dirname + '/src/core/twig.core.header.js',
      __dirname + '/twig.js/src/twig.lib.js',
      __dirname + '/twig.js/src/twig.filters.js',
      __dirname + '/twig.js/src/twig.functions.js',
      __dirname + '/twig.js/src/twig.tests.js',
      __dirname + '/src/core/twig.core.footer.js'
    ])
    .pipe(concat('twig.deps.js'))
    .pipe(gulp.dest('./'))
});

gulp.task('_twig_node', function() {
  return gulp.src([
      __dirname + '/src/core/twig.core.header.js',
      __dirname + '/twig.js/src/twig.lib.js',
      __dirname + '/twig.js/src/twig.filters.js',
      __dirname + '/twig.js/src/twig.functions.js',
      __dirname + '/twig.js/src/twig.tests.js',
      __dirname + '/src/core/twig.core.footer.js'
    ])
    .pipe(concat('twig.deps.js'))
    .pipe(wrap('module.exports = function () {\n<%= contents %>\nreturn Twig\n}'))
    .pipe(gulp.dest('./'))
});

gulp.task('dev', function() {
  gulp.watch(__dirname + '/src/**/*.js', ['js']);
});
