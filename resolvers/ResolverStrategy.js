var extend = require('extend');

function ResolverStrategy(config) {
	this.config = extend(true, {
		basePaths: [],
		extensions: [],
		existingFilesOnly: true,
		indexFile: "index",
	}, config);
}

ResolverStrategy.prototype = {
	resolve: function(includerPath, filePath) {
		throw new PluginError("Dependency", "Your ResolverStrategy must implement the resolve method");
	}
};

ResolverStrategy.resolvers = {};
ResolverStrategy.addResolver = function(name, resolverClass) {
	if (ResolverStrategy.resolvers.hasOwnProperty(name)) {
		throw new PluginError("Dependency", "Finder with name " + name + " is already registered");
	}

	ResolverStrategy.resolvers[name] = resolverClass;
};

ResolverStrategy.create = function(name, config) {
	if (!ResolverStrategy.resolvers.hasOwnProperty(name)) {
		throw new PluginError("Dependency", "Can't find resolver strategy '" + name + "'");
	}

	return new ResolverStrategy.resolvers[name](config);
};

module.exports = ResolverStrategy;
