var gulp = require('gulp'),
    concat = require('gulp-concat'),
    src = __dirname + '/src/**/*.js';

gulp.task('default', ['js']);
gulp.task('dev', ['watch']);

gulp.task('js', function() {
  return gulp.src(src)
    .pipe(concat('twig.compiler.js'))
    .pipe(gulp.dest('./'))
});

gulp.task('watch', function() {
  gulp.watch(src, ['js']);
});
