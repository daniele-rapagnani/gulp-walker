var extend = require('extend');

var Logger = require('../Logger');
var PluginError = require('gulp-util').PluginError;

function FinderStrategy(config) {
	config = config || {};
	this.config = extend(true, {}, config);
}

FinderStrategy.prototype.find = function(content, filePath) {
	throw new PluginError("Dependency", "Your FinderStrategy must implement the find method");
};

FinderStrategy.prototype.shouldIgnore = function(dependency) {
	if (this.config.exclude && this.config.exclude.indexOf(dependency) !== -1) {
		Logger.debug("Ignoring dependecy: ", dependency);
		return true;
	}

	return false;
};

FinderStrategy.finders = {};
FinderStrategy.addFinder = function(name, finderClass) {
	if (FinderStrategy.finders.hasOwnProperty(name)) {
		throw new PluginError("Dependency", "Finder with name " + name + " is already registered");
	}

	FinderStrategy.finders[name] = finderClass;
};

FinderStrategy.create = function(name, config) {
	if (!FinderStrategy.finders.hasOwnProperty(name)) {
		throw new PluginError("Dependency", "Can't find resolver strategy '" + name + "'");
	}

	return new FinderStrategy.finders[name](config);
};

module.exports = FinderStrategy;
