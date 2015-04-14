var extend = require('extend');
var path   = require('path');
var fs     = require('fs');
var util   = require('util');

var ResolverStrategy = require('./ResolverStrategy');
var Logger = require('../Logger');

/**
 * This class implements a basic approach to
 * path resolution that aims at being as flexible
 * as possible.
 *
 * For possible configuration values see
 * the documentation for the ResolverStrategy class.
 *
 * @class
 * @extends ResolverStrategy
 * @param {String} config The configuration of this
 *							path resolver
 */

function BasicResolverStrategy(config) {
	ResolverStrategy.call(this, config);
	this.config = extend(true, this.config, {}, config);
}

util.inherits(BasicResolverStrategy, ResolverStrategy);

/**
 * This function tries to guess the right file requested
 * by an inclusion by trying different combinations of
 * paths, filenames and extensions.
 *
 * The included file can be relative to the including file
 * or absolute. This information may not be explicitly specified,
 * for example by requiring a file simply by its name with no
 * path information.
 *
 * In case of absolute files the base paths specified
 * at construction time are scanned for the requested file.
 * When there is no way to determine if the requested path
 * is realtive or absolute, the file is first resolved as a
 * relative path and then as an absolute path.
 *
 * The requeste file can also be with or without extension.
 * If no extension is provided the extensions specified
 * at construction time are used to guess the filename.
 *
 * If the requested path ends up being a directory, the function
 * tries to resolve the path by looking for an index file inside
 * the directory with the name provided in the configuration.
 *
 * @method
 *
 * @param {String} includerPath The absolute path of the file
 *		requesting the inclusion.
 *
 * @param {String} filePath The path, as expressed in the include
 *		expression of the source language, of the file to be included.
 *
 * @returns {String} The absolute path on the filesystem of the included
 * 		file or null if the file was not found.
 */

BasicResolverStrategy.prototype.resolve = function(includerPath, filePath) {
	var absPath = null;
	var pathAbsolute = (filePath.substr(0, 1) == "/");
	var pathRelative = (filePath.substr(0, 2) == "./" || filePath.substr(0, 3) == "../");
	var pathNotExplicit = !pathAbsolute && !pathRelative;
	var guesses = [];

	if (pathRelative || pathNotExplicit) {
		var absPath = path.join(path.dirname(includerPath), filePath);
		guesses = guesses.concat(this.guessFileExtension([absPath]));
	}

	if (pathAbsolute || pathNotExplicit) {
		var pathGuesses = this.guessPaths(filePath, path.dirname(includerPath));
		guesses = guesses.concat(this.guessFileExtension(pathGuesses));
	}

	Logger.debug(filePath, "resolved to this possible paths", guesses);

	var includedFile = this.getFirstExistingFile(guesses);

	if (includedFile != null) {
		var statInfo = fs.lstatSync(includedFile);

		if (statInfo.isDirectory()) {
			Logger.debug(includedFile, "is a directory, trying to guess index file");
			return this.resolve(includerPath, this.guessDirectoryIndex(includedFile, filePath));
		}

		Logger.info(filePath, "was resolved to",includedFile);
	} else {
		Logger.warn(filePath, "could not be found");
	}

	return includedFile;
};

/**
 * Given an absolute path, the method returns
 * an array filled with a combination of the
 * original path with the extensions provided
 * at configuration time.
 *
 * @method
 * @param {String} absPath The absolute path to an
 *		extension-less file.
 *
 * @returns {Array} An array of possible file paths
 */

BasicResolverStrategy.prototype.guessFileExtension = function(absPaths) {
	var extensions = this.config.extensions.concat([""]);
	var guesses = [];

	for (var j = 0; j < absPaths.length; j++) {
		for (var i = 0; i < extensions.length; i++) {
			var newFile = absPaths[j];

			if (extensions[i].length > 0) {
				newFile = absPaths[j] + "." + extensions[i];
			};

			guesses.push(newFile);
		}
	};

	return guesses;
};

/**
 * Given a base path and a relative path,
 * an array is filled with all the combination
 * of the given path with the provided base path
 * and the base paths provided at configuration-time.
 *
 * @method
 * @param {String} filePath The unaltered path to the file
 * @param {String} basePath The base path that will be used
 *		to look for this file along with the ones in the
 *		configuration. Usually the directory in which the
 *		includer is.
 *
 * @returns An array of possible paths
 */

BasicResolverStrategy.prototype.guessPaths = function(filePath, basePath) {
	if (filePath.substr(0, 1) == "/") {
		filePath = filePath.substr(1);
	}

	var basePaths = [basePath].concat(this.config.basePaths);
	var guesses = [];

	for (var i = 0; i < basePaths.length; i++) {
		guesses.push(path.resolve(path.join(basePaths[i], filePath)));
	}

	return guesses;
};

/**
 * Given the absolute path to a directory
 * and the relative path to that directory,
 * the method tries to guess the name of
 * the index file to be included when
 * the directory is included directly.
 *
 * @method
 * @param {String} absDirPath The absolute path to a
 *		directory
 * @param {String} dirPath The path, as originally provided,
 *		to the directory
 *
 * @returns {String} The relative path to the index file
 */

BasicResolverStrategy.prototype.guessDirectoryIndex = function(absDirPath, dirPath) {
	return dirPath + "/" + this.config.indexFile;
};

/**
 * Checks a list of absolute paths
 * and returns the first one that
 * exists on filesystem.
 *
 * @method
 * @param {Array} absPaths An array of absolute paths to
 *		files.
 *
 * @return {String} The absolute path of a file on success, null
 *			if none could be found
 */

BasicResolverStrategy.prototype.getFirstExistingFile = function(absPaths) {
	for (var i = 0; i < absPaths.length; i++) {
		if (fs.existsSync(absPaths[i])) {
			return absPaths[i];
		}
	}

	return null;
};

ResolverStrategy.addResolver('basic', BasicResolverStrategy);
module.exports = BasicResolverStrategy;
