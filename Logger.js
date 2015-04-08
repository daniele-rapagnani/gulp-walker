var extend = require('extend');
var gutil = require('gulp-util');

function Logger() {
	this.level = Logger.WARN;
	this.silent = false;
}

Logger.prototype = {
	debug: function() {
		if (this.level >= this.DEBUG) {
			this.log(gutil.colors.grey.bold("DEBUG"), arguments);
		}
	},

	info: function() {
		if (this.level >= this.INFO) {
			this.log(gutil.colors.cyan.bold("INFO"), arguments);
		}
	},

	warn: function() {
		if (this.level >= this.WARN) {
			this.log(gutil.colors.yellow.bold("WARN"), arguments);
		}
	},

	log: function(type, args) {
		if (this.silent) {
			return;
		}

		var argsArray = this.argsToArray(args);
		argsArray = ["["+type+"]"].concat(argsArray);
		gutil.log.apply(this, argsArray);
	},

	argsToArray: function(args) {
		var argsArray = [];

		for(var key in args) {
			if (args.hasOwnProperty(key)) {
				argsArray.push(args[key]);
			}
		}

		return argsArray;
	}
};

Logger.prototype.DEBUG = 3;
Logger.prototype.INFO  = 2;
Logger.prototype.WARN  = 1;

module.exports = new Logger();
