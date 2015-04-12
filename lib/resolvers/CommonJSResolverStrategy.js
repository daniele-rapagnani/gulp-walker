var extend = require('extend');
var path   = require('path');
var fs     = require('fs');
var util   = require('util');

var ResolverStrategy = require('./ResolverStrategy');
var BasicResolverStrategy = require('./BasicResolverStrategy');
var Logger = require('../Logger');

/**
 * A resolving strategy that supports CommonJS style
 * requires, as seen in Node.js and Browserify.
 *
 * @class
 * @extends BasicResolverStrategy
 * @param {Object} config A configuration object.
 */

function CommonJSResolverStrategy(config) {
	BasicResolverStrategy.call(this, config);
	this.config = extend(true, this.config, {}, config);
}

util.inherits(CommonJSResolverStrategy, BasicResolverStrategy);

CommonJSResolverStrategy.prototype.resolve = function(includerPath, filePath) {
	if (filePath.substr(0, 2) !== "./" &&
		filePath.substr(0, 3) !== "../" &&
		filePath.substr(0, 1) !== "/")
	{
		filePath = "/"+filePath;
	}

	return CommonJSResolverStrategy.super_.prototype.resolve.call(this, includerPath, filePath);
};

/**
 * This method tries to locate the index file inside
 * a module by reading its package.json file.
 * If no package.json file is found, the method
 * falls back to the parent's method.
 *
 * @method
 * @param {String} absDirPath The absolute path to a 
 *		directory
 * @param {String} dirPath The path, as originally provided,
 *		to the directory
 *
 * @returns {String} The relative path to the index file
 */

CommonJSResolverStrategy.prototype.guessDirectoryIndex = function(absDirPath, dirPath) {
	var packagePath = path.join(absDirPath, 'package.json');

	if (fs.existsSync(packagePath)) {
		var packageObject = require(packagePath);

		if (packageObject.main) {
			return dirPath + "/" + packageObject.main;
		}
	}

	return CommonJSResolverStrategy.super_.prototype.guessDirectoryIndex.call(this, absDirPath, dirPath);
};

ResolverStrategy.addResolver('common-js', CommonJSResolverStrategy);

module.exports = CommonJSResolverStrategy;
