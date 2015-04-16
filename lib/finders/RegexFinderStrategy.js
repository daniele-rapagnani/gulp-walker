var extend = require('extend');
var util   = require('util');

var Logger = require('../Logger');
var FinderStrategy = require('./FinderStrategy');
var PluginError = require('gulp-util').PluginError;

/**
 * This finder strategy tries to identify
 * inclusions in source code by using
 * regexes. This approach may be hackish
 * but works well in most situations. The
 * only limitations are connected to regexes
 * being mostly stateless. For example
 * it may not be a great idea to parse
 * HTML with regexes.
 *
 * @description
 * In addition to the default configuration
 * this finder supports the following
 * configuration:
 *
 * pattern: The regex pattern that will
 * 		be used to find inclusions in source
 *		code. The included file should be
 *		captured by the first capture group
 *		of the regex.
 *
 * @class RegexFinderStrategy
 * @extends FinderStrategy
 * @param {Object} config The configuration
 * 		of this finder strategy
 */

function RegexFinderStrategy(config) {
	config = config || {};

	FinderStrategy.call(this, config);
	this.config = extend(true, this.config, {}, config);
}

util.inherits(RegexFinderStrategy, FinderStrategy);

/**
 * This is the actual method handling the analysis.
 * The provided regex is executed against the file content
 * and all matches are collected and then returned.
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

RegexFinderStrategy.prototype.find = function(content, filePath) {
	if (!this.config.hasOwnProperty('pattern')) {
		throw new PluginError("gulp-walker",
			"To use the RegexFinderStrategy a pattern must be specified."
		);
	}

	var regexes = [].concat(this.config.pattern);
	var results = [];
	var result = null;

	for (var i = 0; i < regexes.length; i++) {
		do {
			result = regexes[i].exec(content);

			if (result !== null && result.length >= 2) {
				if (results.indexOf(result[1]) === -1) {
					if (!this.shouldIgnore(result[1])) {
						results.push(result[1]);
					}
				} else {
					Logger.debug(result[1], "was required more than once by", filePath);
				}
			}
		} while(result !== null);
	}

	if (results.length == 0) {
		Logger.debug("No dependencies found for:", filePath);
	}

	return results;
};

FinderStrategy.addFinder('regex', RegexFinderStrategy);
module.exports = RegexFinderStrategy;
