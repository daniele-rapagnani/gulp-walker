unique = require('array-unique');
Logger = require('./Logger');

function DependenciesList() {
	this.list = {};
}

DependenciesList.prototype = {
	addDependency: function(dependentFile, dependency) {
		if (!this.list.hasOwnProperty(dependency)) {
			this.list[dependency] = [];
		}

		if (!this.isDependant(dependentFile, dependency)) {
			Logger.debug("Dependency", dependency, "added for file", dependentFile);
			this.list[dependency].push(dependentFile);
		}
	},

	removeDependency: function(dependentFile, dependency) {
		if (!this.isDependant(dependentFile, dependency)) {
			return false;
		}

		Logger.debug("Dependency", dependency, "removed for file", dependentFile);
		this.list[dependency].splice(this.list[dependency].indexOf(dependentFile), 1);

		return true;
	},

	isDependant: function(dependentFile, dependency) {
		if (!this.list.hasOwnProperty(dependency)) {
			return false;
		}

		var depIdx = this.list[dependency].indexOf(dependentFile);
		return depIdx !== -1;
	},

	updateDependencies: function(dependentFile, dependencies) {
		var registeredDependencies = Object.keys(this.list)
			.concat(dependencies)
			.filter(function(item, pos, self) {
				return self.indexOf(item) == pos;
			});

		for(var i=0; i < registeredDependencies.length; i++) {
			var dependency = registeredDependencies[i];

			if (dependencies.indexOf(dependency) !== -1) {
				this.addDependency(dependentFile, dependency);
			} else {
				this.removeDependency(dependentFile, dependency);
			}
		}
	},

	getDependencies: function(filePath) {
		if (!this.list.hasOwnProperty(filePath)) {
			return [];
		}

		var dependencies = [].concat(this.list[filePath]);

		for(var i = 0; i < this.list[filePath].length; i++) {
			dependencies = dependencies.concat(this.getDependencies(this.list[filePath][i]));
		}

		return unique(dependencies);
	}
};

module.exports = DependenciesList;
