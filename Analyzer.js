var extend = require('extend');
var path   = require('path');

var DependenciesList = require('./DependenciesList');
var FinderStrategy   = require('./finders/FinderStrategy');
var ResolverStrategy = require('./resolvers/ResolverStrategy');
var Logger           = require('./Logger');

require('./finders/RegexFinderStrategy');
require('./resolvers/BasicResolverStrategy');
require('./resolvers/CommonJSResolverStrategy');

function Analyzer(config) {
	config = config || {};

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
	this.depList = new DependenciesList();

	this.createFinders();
	this.createResolvers();
}

Analyzer.prototype = {
	createFinders: function() {
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
	},

	createResolvers: function() {
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
	},

	resolveDependencies: function(content, filePath) {
		var extension = path.extname(filePath);

		if (!this.finders.hasOwnProperty(extension)) {
			Logger.debug("No finder registered for extension:", extension);
			return null;
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

		this.depList.updateDependencies(filePath, depFiles);

		return this.getDependencies(filePath);
	},

	getDependencies: function(filePath) {
		return this.depList.getDependencies(filePath);
	}
};

module.exports = Analyzer;
