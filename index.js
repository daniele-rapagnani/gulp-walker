var through   = require('through2');
var gutil     = require('gulp-util');
var extend    = require('extend');
var vinylFile = require('vinyl-file');

var StringDecoder = require('string_decoder').StringDecoder;
var Analyzer      = require('./Analyzer');
var Logger        = require('./Logger');

var resolver = null;

module.exports = function(config) {
	var firstRun = false;

	config = extend(true, {
		stopperOnFirstRun: true,
		debug: false
	}, config);

	Logger.level = config.debug ? Logger.DEBUG : Logger.WARN;

	if (resolver === null) {
		resolver = new Analyzer(config);
		firstRun = true;
	}

	return through.obj(function(file, enc, cb) {
		var decoder = new StringDecoder(enc);
		var content = decoder.write(file.contents);

		var dependencies = resolver.resolveDependencies(content, file.path);

		if (!firstRun) {
			for (var i = 0; i < dependencies.length; i++) {
				var dependency = dependencies[i];
				var dependencyFile = vinylFile.readSync(dependency, {
					cwd: file.cwd,
					base: file.base
				});

				this.push(dependencyFile);
			}
		}

		if (!firstRun || !config.stopperOnFirstRun) {
			this.push(file);
		}

		cb();
	});
};
