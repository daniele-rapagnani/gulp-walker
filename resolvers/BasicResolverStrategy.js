var extend = require('extend');
var path   = require('path');
var fs     = require('fs');
var util   = require('util');

var ResolverStrategy = require('./ResolverStrategy');
var Logger = require('../Logger');

function BasicResolverStrategy(config) {
	ResolverStrategy.call(this, config);
	this.config = extend(true, this.config, {}, config);
}

util.inherits(BasicResolverStrategy, ResolverStrategy);

BasicResolverStrategy.prototype.resolve = function(includerPath, filePath) {
	var basePath = path.resolve(path.dirname(includerPath));
	var absPath = path.resolve(basePath, filePath);
	var realFile = this.checkExistingVariants(absPath);

	if (!realFile) {
		if (!this.config.existingFilesOnly) {
			return absPath;
		} else {
			Logger.warn("Can't find file:", filePath, "included by", includerPath);
		}
	}

	return realFile;
};

BasicResolverStrategy.prototype.checkExistingVariants = function(filePath) {
	var basePaths = [""].concat(this.config.basePaths);
	var extensions = [""].concat(this.config.extensions);

	for (var j = 0; j < basePaths.length; j++) {
		var altPath = filePath;

		if (basePaths[j].length > 0) {
			var basePath = path.resolve(basePaths[j]);
			altPath = path.join(basePath, filePath);
		}

		for (var i = 0; i < extensions.length; i++) {
			var newFile = altPath;

			if (extensions[i].length > 0) {
				newFile = altPath + "." + extensions[i];
			}

			Logger.debug("Trying with:", newFile);

			if (fs.existsSync(newFile)) {
				var statInfo = fs.lstatSync(newFile);

				if (statInfo.isDirectory()) {
					Logger.debug("Found directory:", newFile);
					newFile = this.checkDirectory(newFile);
				} else {
					Logger.debug("Found file:", newFile);
				}

				return newFile;
			}
		}
	}

	return null;
};

BasicResolverStrategy.prototype.checkDirectory = function(dirPath) {
	return this.checkExistingVariants(path.join(dirPath, this.config.indexFile));
};

ResolverStrategy.addResolver('basic', BasicResolverStrategy);
module.exports = BasicResolverStrategy;
