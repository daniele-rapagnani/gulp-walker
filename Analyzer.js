var extend = require('extend');
var path   = require('path');

var FinderStrategy   = require('./finders/FinderStrategy');
var ResolverStrategy = require('./resolvers/ResolverStrategy');
var Logger           = require('./Logger');

require('./finders/RegexFinderStrategy');
require('./resolvers/BasicResolverStrategy');
require('./resolvers/CommonJSResolverStrategy');

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
						pattern: /^\s*(?:[a-zA-Z0-9_-]+\s*=)?\s*require\s*(?:\()?['"]([^'"]+)['"](?:\))?/gm
					}
				}
			],

			js: [
				{
					name: 'regex',
					config: {
						pattern: /^\s*(?:[a-zA-Z0-9_-]+\s*=)?\s*require\s*\(?['"]([^'"]+)['"]\)?/gm
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
					"Dependency",
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
					"Dependency",
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

Analyzer.prototype.isUnprocessedFile = function(filePath) {
	return !this.state.processedFiles.hasOwnProperty(filePath);
};

Analyzer.prototype.getDependencies = function(filePath) {
	return this.state.depList.getDependencies(filePath);
};

Analyzer.prototype.registerFileBase = function(file) {
	return this.state.fileBases[file.path] = file.base;
};

Analyzer.prototype.getFileBase = function(filePath) {
	if (!this.state.fileBases.hasOwnProperty(filePath)) {
		return false;
	}

	return this.state.fileBases[filePath];
}

module.exports = Analyzer;
