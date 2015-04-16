var path = require("path");
var assert = require("assert");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var glob = require("glob");
var fs = require("fs");

var RegexFinderStrategy = require('../lib/finders/RegexFinderStrategy');
var BasicResolverStrategy = require('../lib/resolvers/BasicResolverStrategy');
var Analyzer = require('../lib/Analyzer');
var AnalyzerState = require('../lib/AnalyzerState');
var Logger = require('../lib/Logger');

describe('RegexFinderStrategy', function() {
	describe('#find', function() {

		it('should throw exception if no pattern specified', function() {
			var regexFinder = new RegexFinderStrategy({});

			try {
				regexFinder.find(null, null);
			} catch(e) {
				if (e.message == "To use the RegexFinderStrategy a pattern must be specified.") {
					return
				} else {
					throw new Error("An unexpected exception has been thrown: " + e);
				}
			}

			throw new Error("No exception has been thrown");
		});

		it('should capture the first group of the pattern, globally, on multiple lines', function() {
			var regexFinder = new RegexFinderStrategy({
				pattern: /test:\s*([a-z]+) (ignore)/gm
			});

			var results = regexFinder.find(
				"ignore me\ntest: gotme ignore\nignore me too\ntest: gotmetoo ignore\n",
				'test'
			);

			results.should.eql(['gotme', 'gotmetoo']);
		});
	});
});

describe('BasicResolverStrategy', function() {
	describe('#resolve', function() {

		it('should resolve relative paths relative to the includer', function() {
			var basicResolver = new BasicResolverStrategy();

			var result = basicResolver.resolve(path.join(__dirname, 'files/mock/test.txt'), './nested/a.txt');
			expect(result).not.to.be.null;
			result.should.eql([ path.join(__dirname, 'files/mock/nested/a.txt') ]);
		});

		it('should resolve absolute paths from the given basepaths', function() {
			var basicResolver = new BasicResolverStrategy({
				basePaths: [
					path.join(__dirname, "files/mock/external/"),
					path.join(__dirname, "files/mock/nested/"),
				]
			});

			var result = basicResolver.resolve(path.join(__dirname, 'files/mock/test.txt'), 'b.txt');
			expect(result).not.to.be.null;
			result.should.eql([ path.join(__dirname, 'files/mock/external/b.txt') ]);
		});

		it('should resolve non explicit paths as relative first than as absolute', function() {
			var basicResolver = new BasicResolverStrategy({
				basePaths: [
					path.join(__dirname, "files/mock/nested"),
				]
			});

			var result = basicResolver.resolve(path.join(__dirname, 'files/mock/test.txt'), 'same.txt');
			expect(result).not.to.be.null;
			result.should.eql([ path.join(__dirname, 'files/mock/same.txt') ]);

			var result = basicResolver.resolve(path.join(__dirname, 'files/mock/test.txt'), 'a.txt');
			expect(result).not.to.be.null;
			result.should.eql([ path.join(__dirname, 'files/mock/nested/a.txt') ]);
		});

		it('should append the given extensions to the required file', function() {
			var basicResolver = new BasicResolverStrategy({
				extensions: [ 'mock', 'txt' ]
			});

			var result = basicResolver.resolve(path.join(__dirname, 'files/mock/test.txt'), './nested/a');
			expect(result).not.to.be.null;
			result.should.eql([ path.join(__dirname, 'files/mock/nested/a.txt') ]);
		});

		it('should search for an index file inside required directories', function() {
			var basicResolver = new BasicResolverStrategy({
				indexFile: 'app',
				extensions: [ 'txt' ],
				basePaths: [
					path.join(__dirname, "files/mock/external/")
				]
			});

			var result = basicResolver.resolve(path.join(__dirname, 'files/mock/test.txt'), 'module');
			expect(result).not.to.be.null;
			result.should.eql([ path.join(__dirname, 'files/mock/external/module/app.txt') ]);
		});
	});
});

function checkProjectDependencies(projectPath, expectedResult, analyzerConf, done) {
	var state = new AnalyzerState();
	var analyzer = new Analyzer(analyzerConf, state);

	var transformedResults = {};

	for (var file in expectedResult) {
		newFile = path.join(__dirname, 'files/' + file);
		transformedResults[newFile] = expectedResult[file].map(function(item) {
			return path.join(__dirname, 'files/' + item);
		});
	}

	glob(__dirname + '/files' + projectPath, function(err, files) {
		for (var i = 0; i < files.length; i++) {
			var content = fs.readFileSync(files[i], { encoding: 'utf8' });
			analyzer.resolveDependencies(content, files[i]);
		};

		state.depList.list.should.eql(transformedResults);

		done();
	});
}

describe('Analyzer', function() {
	describe('#resolveDependencies', function() {
		it('should correctly resolve dependencies for stylus', function(done) {
			checkProjectDependencies('/stylus/**/*.styl', {
				'stylus/library/other_module/same_level.styl' : [
					'stylus/library/other_module/index.styl'
				],
				'stylus/library/other_module/index.styl' : [
					'stylus/library/module/index.styl'
				],
				'stylus/library/module/index.styl' : [
					'stylus/src/nested/nested_file.styl'
				],
				'stylus/src/nested/nested_file.styl' : [
					'stylus/src/same_level.styl'
				],
				'stylus/src/other_nested/other_nested_file.styl' : [
					'stylus/src/nested/nested_file.styl'
				],
				'stylus/src/glob/a.styl' : [
					'stylus/src/other_nested/other_nested_file.styl'
				],
				'stylus/src/glob/b.styl' : [
					'stylus/src/other_nested/other_nested_file.styl'
				],
				'stylus/src/glob/c.styl' : [
					'stylus/src/other_nested/other_nested_file.styl'
				],
				'stylus/src/same_level.styl' : [
					'stylus/src/app.styl'
				],
			}, {
				resolvers: {
					styl: [{
						config: {
							basePaths: path.join(__dirname, 'files/stylus/library')
						}
					}]
				}
			},
			done);
		});

		it('should correctly resolve dependencies for CommonJS', function(done) {
			checkProjectDependencies('/coffee/**/*.*', {
				'coffee/library/other_module/same_level.js' : [
					'coffee/library/other_module/index.js'
				],
				'coffee/library/other_module/index.js' : [
					'coffee/library/module/dist/main.js'
				],
				'coffee/library/module/dist/main.js' : [
					'coffee/src/nested/nested_file.coffee'
				],
				'coffee/src/nested/nested_file.coffee' : [
					'coffee/src/same_level.coffee'
				],
				'coffee/src/other_nested/other_nested_file.coffee' : [
					'coffee/src/nested/nested_file.coffee'
				],
				'coffee/src/same_level.coffee' : [
					'coffee/src/app.coffee'
				],
			}, {
				resolvers: {
					coffee: [{
						config: {
							basePaths: path.join(__dirname, 'files/coffee/library')
						}
					}],

					js: [{
						config: {
							basePaths: path.join(__dirname, 'files/coffee/library')
						}
					}]
				}
			},
			done);
		});
	});
});
