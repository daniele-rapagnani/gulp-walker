var extend = require('extend');

/**
 * This class represents the abstract implementation
 * of a path resolver strategy.
 *
 * Resolver strategies are used to resolve
 * the path of an inclusion as expressed
 * in its native language to an actual file
 * path on the file system.
 *
 * @description
 * By default resolvers accept the following
 * configuration:
 *
 * basePaths: An array of paths that will be used
 *				to resolve absolute paths.
 * extensions: An array of extensions that will be
 *				appended to the original file name
 *				if the file as it is could not be
 *				located.
 * indexFile: The name of the file to look for
 *				if the included path is resolved
 *				to a directory. The file will be
 *				treated as a normal incoming path
 *				so there is no need to specify an
 *				extension.
 *
 * This class also acts as registry of all path resolvers.
 * When a new resolver is implemented it must be registered
 * with this class, like this:
 * 
 * <pre><code>
 * ResolverStrategy.addResolver('resolver_name', YourResolverStrategy);
 * </code></pre>
 *
 * @class 
 * @param {Object} config The configuraton to be used
 * 		by this strategy
 */

function ResolverStrategy(config) {
	this.config = extend(true, {
		basePaths: [],
		extensions: [],
		indexFile: "index",
	}, config);
}

/**
 * This method must be overrided with your own logic.
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

ResolverStrategy.prototype.resolve = function(includerPath, filePath) {
	throw new PluginError("gulp-walker", "Your ResolverStrategy must implement the resolve method");
};

ResolverStrategy.resolvers = {};

/**
 * Register a new resolver implementation under
 * the provided name.
 *
 * @method
 * @static
 * @param {String} name The with which this resolver
 *		will be registered.
 * @param {Function} resolverClass The resolver class
 * @throws {PluginError} If a resolver with the given
 *		name already exists.
 */

ResolverStrategy.addResolver = function(name, resolverClass) {
	if (ResolverStrategy.resolvers.hasOwnProperty(name)) {
		throw new PluginError("gulp-walker", "Finder with name " + name + " is already registered");
	}

	ResolverStrategy.resolvers[name] = resolverClass;
};

/**
 * Factory method to create a resolver
 * given its name and a configuration
 *
 * @param {String} name The name of the resolver
 *		to be instantiated.
 * @param {Object} config The configuration
 *		with which it will be instantiated.
 *
 * @throws {PluginError} If no resolver with the
 *		provided name could be found
 * 
 * @returns {Object} A new instance of the requested
 *		resolver
 */

ResolverStrategy.create = function(name, config) {
	if (!ResolverStrategy.resolvers.hasOwnProperty(name)) {
		throw new PluginError("gulp-walker", "Can't find resolver strategy '" + name + "'");
	}

	return new ResolverStrategy.resolvers[name](config);
};

module.exports = ResolverStrategy;
