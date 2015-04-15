var extend = require('extend');
var path   = require('path');

var FinderStrategy   = require('./finders/FinderStrategy');
var ResolverStrategy = require('./resolvers/ResolverStrategy');
var Logger           = require('./Logger');

require('./finders/RegexFinderStrategy');
require('./resolvers/BasicResolverStrategy');
require('./resolvers/CommonJSResolverStrategy');

/**
 * This class finds and resolves all the dependencies
 * within a set of source files. In order to do
 * so finders' and resolvers' strategies are used
 * and the results are collected.
 *
 * The state of the analyzer is externalized in order
 * to preserve the dependencies graph within different
 * instances of the analyzer.
 *
 * @description
 * The configuration of the analyzer has the following
 * structure:
 *
 * <pre><code>
 * {
 *	finders: {
 *		fileExt: [
 *			{
 *				name: 'finder-name',
 *				config: {
 *					// Finder configuration
 *				}
 *			}
 *		],
 *
 *		fileExt2: [
 *			//...
 *		]
 *	},
 *
 *	resolvers: {
 *		fileExt: [
 *			{
 *				name: 'resolver-name',
 *				config: {
 *					// Resolver configuration
 *				}
 *			}
 *		],
 *
 *		fileExt2: [
 *			//...
 *		]
 *	}
 * }
 * </code></pre>
 *
 * If multiple resolvers/finders are specified
 * their result will be aggregated.
 *
 * @class Analyzer
 * @param {Object} config The configuration of this
 *		analyzer instance
 * @param {AnalyzerState} state The state to be used
 *		in the analysis
 */

function Analyzer(config, state) {
	config = config || {};

	this.state = state;

	this.config = extend(true, {
		finders: {
			styl : [
				{
					name: 'regex',
					config: {
						pattern: /^\s*(?:@import|@require)\s+['"](.+?)['"](?:$|;)/gm,
						exclude: ['nib']
					}
				}
			],

			coffee: [
				{
					name: 'regex',
					config: {
						pattern: /^\s*(?:.+?\s*[=\:\(\{\;])?\s*require\s*(?:\()?['"]([^'"]+)['"](?:\))?/gm
					}
				}
			],

			cjsx: [
				{
					name: 'regex',
					config: {
						pattern: /^\s*(?:.+?\s*[=\:\(\{\;])?\s*require\s*(?:\()?['"]([^'"]+)['"](?:\))?/gm
					}
				}
			],

			js: [
				{
					name: 'regex',
					config: {
						pattern: /^\s*(?:.+?\s*[=\:\(\{\;])?\s*require\s*\(?['"]([^'"]+)['"]\)?/gm
					}
				}
			],

			jsx: [
				{
					name: 'regex',
					config: {
						pattern: /^\s*(?:.+?\s*[=\:\(\{\;])?\s*require\s*\(?['"]([^'"]+)['"]\)?/gm
					}
				}
			]
		},

		resolvers: {
			styl : [
				{
					name: 'basic',
					config: {
						extensions: [
							'styl',
							'css'
						]
					}
				}
			],

			coffee: [
				{
					name: 'common-js',
					config: {
						extensions: [
							'coffee',
							'js',
							'cjsx',
							'jsx'
						]
					}
				}
			],


			cjsx: [
				{
					name: 'common-js',
					config: {
						extensions: [
							'coffee',
							'js',
							'cjsx',
							'jsx'
						]
					}
				}
			],

			js: [
				{
					name: 'common-js',
					config: {
						extensions: [
							'js',
							'jsx'
						]
					}
				}
			],

			jsx: [
				{
					name: 'common-js',
					config: {
						extensions: [
							'js',
							'jsx'
						]
					}
				}
			]
		}
	}, config);

	this.finders = {};
	this.resolvers = {};

	this.createFinders();
	this.createResolvers();
}

Analyzer.prototype.createFinders = function() {
	for (var extension in this.config.finders) {
		if (!this.config.finders.hasOwnProperty(extension))
			continue;

		var finders = this.config.finders[extension];

		var extKey = '.'+extension;

		if (!this.finders.hasOwnProperty(extKey))
			this.finders[extKey] = [];

		for (var i = 0; i < finders.length; i++) {
			var item = finders[i];

			if (!item.name) {
				throw new PluginName(
					"gulp-walker",
					"Wrong finder strategy configuration entry. No name specified: " + JSON.stringify(item)
				);
			}

			item.config = item.config || {};

			var strategy = FinderStrategy.create(item.name, item.config);
			this.finders[extKey].push(strategy);
		}
	}
};

Analyzer.prototype.createResolvers = function() {
	for (var extension in this.config.resolvers) {
		if (!this.config.resolvers.hasOwnProperty(extension))
			continue;

		var resolvers = this.config.resolvers[extension];

		var extKey = '.'+extension;

		if (!this.resolvers.hasOwnProperty(extKey))
			this.resolvers[extKey] = [];

		for (var i = 0; i < resolvers.length; i++) {
			var item = resolvers[i];

			if (!item.name) {
				throw new PluginError(
					"gulp-walker",
					"Wrong path resolver strategy configuration entry. No name specified: " +
					JSON.stringify(item)
				);
			}

			item.config = item.config || {};

			var strategy = ResolverStrategy.create(item.name, item.config);
			this.resolvers[extKey].push(strategy);
		};
	}
};

/**
 * This method is the one performing the analysis:
 * it finds the dependencies and resolves them
 * on the filesystem according to the analyzer's
 * configuration.
 *
 * @method
 * @param {String} content The content of the file to be
 *		analyzed by this finder.
 *
 * @param {String} filePath The absolute path of the
 *		file being analyzed. Can be used for debugging
 *		purposes.
 *
 * @returns {Array} An array of all the files that should be
 *		updated when the provided file changes
 */

Analyzer.prototype.resolveDependencies = function(content, filePath) {
	var extension = path.extname(filePath);

	if (!this.finders.hasOwnProperty(extension)) {
		Logger.warn("No finder registered for extension:", extension);
		this.state.processedFiles[filePath] = true;
		return [];
	}

	var depFiles = [];

	for (var i = 0; i < this.finders[extension].length; i++) {
		var finder = this.finders[extension][i];
		var dependencies = finder.find(content, filePath);

		for (var j = 0; j < dependencies.length; j++) {
			var dependencyPath = dependencies[j];

			if (this.resolvers.hasOwnProperty(extension)) {
				for (var k = 0; k < this.resolvers[extension].length; k++) {
					var absPath = this.resolvers[extension][k].resolve(filePath, dependencyPath);

					if (absPath !== null) {
						dependencyPath = absPath;
					} else {
						Logger.debug("Can't find file:", dependencyPath);
					}
				}
			}

			depFiles.push(dependencyPath);
		}
	}

	this.state.depList.updateDependencies(filePath, depFiles);
	this.state.processedFiles[filePath] = true;

	return this.getDependencies(filePath);
};

/**
 * Checks if the provided file was already processed.
 * The information is extracted from this analyzer's
 * state.
 *
 * @method
 * @param {String} filePath The absolute path
 *		of the file to be tested
 * @returns {Boolean} True if the file was already
 *		processed, false otherwise
 */

Analyzer.prototype.isUnprocessedFile = function(filePath) {
	return !this.state.processedFiles.hasOwnProperty(filePath);
};

/**
 * Gets a list of the files that should be changed
 * when the provided file changes.
 *
 * @method
 * @param {String} filePath The absolute path of the
 * 		file of which dependencies are wanted
 * @returns {Array} An array of absolute file paths
 */

Analyzer.prototype.getDependencies = function(filePath) {
	return this.state.depList.getDependencies(filePath);
};

/**
 * Processed files bases must be saved because they
 * depend on the glob pattern used by the gulp task.
 * The paths are then used to push the files back
 * on the gulp stream.
 *
 * @param {VinylFile} The vinyl file from which
 *		the base will be extracted
 */

Analyzer.prototype.registerFileBase = function(file) {
	return this.state.fileBases[file.path] = file.base;
};

/**
 * Gets the base of a file as registered by
 * {@link Analyzer.registerFileBase}.
 *
 * @method
 * @param {String} filePath The absolute path of the
 * 		file of which dependencies are wanted.
 * @returns The base for the provided file or false
 *		if a base for this file was never registered
 */

Analyzer.prototype.getFileBase = function(filePath) {
	if (!this.state.fileBases.hasOwnProperty(filePath)) {
		return false;
	}

	return this.state.fileBases[filePath];
}

module.exports = Analyzer;
