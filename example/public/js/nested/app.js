(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
console.log("Non standard named main.js!!");

},{}],2:[function(require,module,exports){
require('./library_b.js');

module.exports = function() {
  return console.log('Library A');
};



},{"./library_b.js":3}],3:[function(require,module,exports){
module.exports = function() {
	console.log("Library B");
}

},{}],4:[function(require,module,exports){
require('./dependency');

console.log('A');



},{"./dependency":5}],5:[function(require,module,exports){
require('./nested_dependency');

require('./submodule');

console.log('B');



},{"./nested_dependency":6,"./submodule":7}],6:[function(require,module,exports){
require('library_a');

console.log('C');



},{"library_a":2}],7:[function(require,module,exports){
require('external_module');

console.log('SUBMODULE');



},{"external_module":1}]},{},[4]);
