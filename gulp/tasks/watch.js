var gulp  = require('gulp');
var config= require('../config');

gulp.task('watch', function() {
  gulp.watch(config.src.src, ['src']);
  gulp.watch(config._twig.src, ['_twig']);
});
