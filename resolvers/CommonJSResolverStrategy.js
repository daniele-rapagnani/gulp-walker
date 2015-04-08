var extend = require('extend');
var path   = require('path');
var fs     = require('fs');
var util   = require('util');

var ResolverStrategy = require('./ResolverStrategy');
var BasicResolverStrategy = require('./BasicResolverStrategy');
var Logger = require('../Logger');

function CommonJSResolverStrategy(config) {
	BasicResolverStrategy.call(this, config);
	this.config = extend(true, this.config, {}, config);
}

util.inherits(CommonJSResolverStrategy, BasicResolverStrategy);

CommonJSResolverStrategy.prototype.resolve = function(includerPath, filePath) {
	if (filePath.substr(0, 2) !== "./" && filePath.substr(0, 3) !== "../") {
		filePath = "/"+filePath;
	}

	return CommonJSResolverStrategy.super_.prototype.resolve.call(this, includerPath, filePath);
};

CommonJSResolverStrategy.prototype.checkDirectory = function(dirPath) {
	var packagePath = path.join(dirPath, 'package.json');

	if (fs.existsSync(packagePath)) {
		var packageObject = require(packagePath);

		if (packageObject.main) {
			return this.checkExistingVariants(path.join(dirPath, packageObject.main));
		}
	}

	return this.checkExistingVariants(path.join(dirPath, this.config.indexFile));
};

ResolverStrategy.addResolver('common-js', CommonJSResolverStrategy);

module.exports = CommonJSResolverStrategy;
