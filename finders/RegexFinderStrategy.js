var extend = require('extend');
var util   = require('util');

var Logger = require('../Logger');
var FinderStrategy = require('./FinderStrategy');

function RegexFinderStrategy(config) {
	config = config || {};

	FinderStrategy.call(this, config);
	this.config = extend(true, this.config, {}, config);
}

util.inherits(RegexFinderStrategy, FinderStrategy);

RegexFinderStrategy.prototype.find = function(content, filePath) {
	var regex = this.config.pattern;
	var results = [];
	var result = null;

	do {
		result = regex.exec(content);

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

	if (results.length == 0) {
		Logger.debug("No dependencies found for:", filePath);
	}

	return results;
};

FinderStrategy.addFinder('regex', RegexFinderStrategy);
module.exports = RegexFinderStrategy;
