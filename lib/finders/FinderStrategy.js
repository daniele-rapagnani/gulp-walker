var extend = require('extend');

var Logger = require('../Logger');
var PluginError = require('gulp-util').PluginError;

/**
 * This class represents the abstract implementation
 * of a dependency finder strategy.
 *
 * Finder strategies are used to locate inclusions
 * inside source files of one or more language.
 *
 * @description
 * By default finders accept the following
 * configuration:
 *
 * exclude: An array of inclusions to be ignored.
 *			Useful for built-in libraries that
 *			would not be resolved to any physical
 *			file on the filesystem.
 *
 * This class also acts as registry of all dependencies finders.
 * When a new finder is implemented it must be registered
 * with this class, like this:
 * 
 * <pre><code>
 * FinderStrategy.addFinder('finder_name', YourFinderStrategy);
 * </code></pre>
 *
 * @class 
 * @param {Object} config The configuraton to be used
 * 		by this strategy
 */

function FinderStrategy(config) {
	config = config || {};
	this.config = extend(true, {}, config);
}

/**
 * This method must be overrided with your own logic.
 * 
 * @method
 * @param {String} content The content of the file to be
 *		analyzed by this finder.
 *
 * @param {String} filePath The absolute path of the
 *		file being analyzed. Can be used for debugging
 *		purposes.
 *
 * @returns {Array} An array of strings representing
 *		the dependencies requested by the provided file.
 *		The strings are as expressed and are not resolved
 *		in any way at this stage.
 */

FinderStrategy.prototype.find = function(content, filePath) {
	throw new PluginError("gulp-walker", "Your FinderStrategy must implement the find method");
};

/**
 * Checks if a given dependency should be ignored
 * because it was found in the excluded array
 * provided at configuration time.
 * 
 * @method
 * @param {String} dependency The dependency to be
 *		checked.
 *
 * @returns {Boolean} True if the dependency should be ignored
 *		false otherwise.
 */

FinderStrategy.prototype.shouldIgnore = function(dependency) {
	if (this.config.exclude && this.config.exclude.indexOf(dependency) !== -1) {
		Logger.debug("Ignoring dependecy: ", dependency);
		return true;
	}

	return false;
};

FinderStrategy.finders = {};

/**
 * Register a new finder implementation under
 * the provided name.
 *
 * @method
 * @static
 * @param {String} name The with which this finder
 *		will be registered.
 * @param {Function} finderClass The finder class
 * @throws {PluginError} If a finder with the given
 *		name already exists.
 */

FinderStrategy.addFinder = function(name, finderClass) {
	if (FinderStrategy.finders.hasOwnProperty(name)) {
		throw new PluginError("gulp-walker", "Finder with name " + name + " is already registered");
	}

	FinderStrategy.finders[name] = finderClass;
};

/**
 * Factory method to create a finder
 * given its name and a configuration
 *
 * @param {String} name The name of the finder
 *		to be instantiated.
 * @param {Object} config The configuration
 *		with which it will be instantiated.
 *
 * @throws {PluginError} If no finder with the
 *		provided name could be found
 * 
 * @returns {Object} A new instance of the requested
 *		finder
 */

FinderStrategy.create = function(name, config) {
	if (!FinderStrategy.finders.hasOwnProperty(name)) {
		throw new PluginError("gulp-walker", "Can't find resolver strategy '" + name + "'");
	}

	return new FinderStrategy.finders[name](config);
};

module.exports = FinderStrategy;
