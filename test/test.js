var path = require("path");
var assert = require("assert");
var chai = require("chai");
var should = chai.should();
var RegexFinderStrategy = require('../lib/finders/RegexFinderStrategy');
var BasicResolverStrategy = require('../lib/resolvers/BasicResolverStrategy');
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

			var result = basicResolver.resolve(path.join(__dirname, 'files/test.txt'), './nested/a.txt');
			result.should.equal(path.join(__dirname, 'files/nested/a.txt'));
		});

	});
});
