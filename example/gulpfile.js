'use strict';

var gulp       = require('gulp');
var rename     = require('gulp-rename');
var cache      = require('gulp-cached');
var filter     = require('gulp-filter');
var gutil      = require('gulp-util');
var tap        = require('gulp-tap');

var source     = require('vinyl-source-stream');

var path       = require('path');

var through    = require('through2');
var browserify = require('browserify');
var coffeeify  = require('coffeeify');

var dependency = require('dependency');
var Logger = require('dependency/Logger');

gulp.task('scripts', function() {

	var sourceDir = './src/';
	var outputDir = './public/';

	return gulp.src(sourceDir + "**/*.coffee")
		.pipe(cache('scripts'))
		.pipe(dependency({
			debug: Logger.INFO
		}))
		.pipe(filter(["**/app.coffee"]))
		.pipe(through.obj(function(file, enc, cb) {
			var b = browserify({
				entries: file.path,
				extensions: ['.coffee'],
				transform: [coffeeify]
			});

			b.on('file', function(file) {
				gutil.log(file + gutil.colors.green(" was bundled"));
			});

			var self = this;
			var selfCb = cb;

			var filePath = path.relative(path.resolve(sourceDir), file.path);

			b.bundle()
				.pipe(source(filePath))
				.pipe(rename({extname: '.js'}))
				.pipe(through.obj(function(file, enc, cb) {
					self.push(file);
					selfCb();
					cb();
				}))
			;
		}))
		.pipe(gulp.dest(outputDir))
	;
});

gulp.task('watch', ['scripts'], function() {
	gulp.watch("./src/**/**.coffee", ['scripts']);
});

gulp.task('default', ['watch']);
