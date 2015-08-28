// Load plugins
var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    cache = require('gulp-cache');

// lint and minify js files and save them in js directory
gulp.task('lint-minify-js', function() {
  return gulp.src(['js/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});
// minify css files and save them in css directory
gulp.task('minify-css', function() {
  return gulp.src(['css/*.css'])
    .pipe(minifycss())
    .pipe(gulp.dest('dist/css'));
});
// compress images and save them in images directory
gulp.task('compress-image', function() {
  return gulp.src(['images/*.{jpg,jpeg,png}'])
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'));
});
// Default Task runs the folowing tasks: lint-minify-js, minify-css, compress-image
gulp.task('default', ['lint-minify-js', 'minify-css', 'compress-image']);
