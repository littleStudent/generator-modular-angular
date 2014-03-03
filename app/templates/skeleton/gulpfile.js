var gulp = require('gulp');
var gutil = require('gulp-util');
var express = require('express');
var path = require('path');
var tinylr = require('tiny-lr');
var jshint = require('gulp-jshint');

gulp.task('lint', function () {
	return gulp.src(['./**/*.js', '!node_modules/**', '!bower_components/**'])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('default'));
});

var createServers = function (port, lrport) {
	var lr = tinylr(),
		app = express();

	lr.listen(lrport, function () {
		gutil.log('LR Listening on', lrport);
	});

	app.use(express.static(path.resolve('./')));
	app.listen(port, function () {
		gutil.log('Listening on', port);
	});

	return {
		lr: lr,
		app: app
	};
};

var port = Number(process.env.PORT || 8080);
var servers = createServers(port, 35729);

gulp.task('default', ['lint'], function () {
	gulp.watch(["./**/*", "!./node_modules/**/*", "!./bower_components/**/*"], function (evt) {
		gutil.log(gutil.colors.cyan(evt.path), 'changed');
		servers.lr.changed({
			body: {
				files: [evt.path]
			}
		});
	});
});