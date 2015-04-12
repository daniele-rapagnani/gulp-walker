'use strict';

var gulp       = require('gulp');
var rename     = require('gulp-rename');
var cache      = require('gulp-cached');
var filter     = require('gulp-filter');
var gutil      = require('gulp-util');
var stylus     = require('gulp-stylus');

var source     = require('vinyl-source-stream');

var path       = require('path');

var through    = require('through2');
var browserify = require('browserify');
var coffeeify  = require('coffeeify');

var walker = require('gulp-walker');
var Logger = require('gulp-walker/lib/Logger');

gulp.task('scripts', function() {
	var sourceDir = './src/js/';
	var outputDir = './public/js/';
	var srcs = [
		sourceDir + "**/*.coffee",
		"./libs/js/**/*.coffee",
		"./libs/js/**/*.js"
	];

	return gulp.src(srcs)
		.pipe(cache('scripts'))
		.pipe(walker({
			debug: Logger.INFO,
			resolvers: {
				coffee: [{
					config: {
						basePaths: ["./libs/js/"]
					}
				}]
			}
		}))
		.pipe(filter(["**/app.coffee"]))
		.pipe(through.obj(function(file, enc, cb) {
			var b = browserify({
				entries: file.path,
				extensions: ['.coffee'],
				transform: [coffeeify],
				paths: ['./libs/js']
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

gulp.task('styles', function() {
	var srcs = [
		"./src/css/**/*.styl",
		"./libs/css/**/*.styl",
		"./libs/css/**/*.css"
	];

	return gulp.src(srcs)
		.pipe(cache('styles'))
		.pipe(walker({
			debug: Logger.INFO,
			resolvers: {
				styl: [{
					config: {
						basePaths: ["./libs/css/"]
					}
				}],
			}
		}))
		.pipe(filter("**/app.styl"))
		.pipe(stylus({
			include: ['./libs/css/']
		}))
		.pipe(gulp.dest('./public/css/'))
})

gulp.task('watch', ['scripts', 'styles'], function() {
	gulp.watch([
		"./src/**/*.styl",
		"./src/**/*.coffee",
		"./src/**/*.js",
		"./src/**/*.css",
		"./libs/**/*.styl",
		"./libs/**/*.coffee",
		"./libs/**/*.css",
		"./libs/**/*.js"
	], ['scripts', 'styles']);
});

gulp.task('default', ['watch']);
