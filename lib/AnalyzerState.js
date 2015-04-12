var DependenciesList = require('./DependenciesList');

function AnalyzerState() {
	this.processedFiles = {};
	this.depList = new DependenciesList();
	this.fileBases = {};
};

module.exports = AnalyzerState;
