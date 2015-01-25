var gulp = require('gulp'),
    concat = require('gulp-concat'),
    wrap = require("gulp-wrap"),
    config = require('../config');

gulp.task('src', function() {
  return gulp.src(config.src.src)
    .pipe(concat(config.src.file_name))
    .pipe(wrap(config.wrapper()))
    .pipe(gulp.dest(config.src.dest))
});

gulp.task('_twig', function() {
  return gulp.src(config._twig.src)
    .pipe(concat(config._twig.file_name))
    .pipe(wrap(config.wrapper('_twig', '')))
    .pipe(gulp.dest(config._twig.dest))
});
