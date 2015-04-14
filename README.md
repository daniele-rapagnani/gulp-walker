## Information
**gulp-walker** is a gulp plugin that allows for dependencies aware incremental building.
It is conceived to scale well with big projects, with a complex dependecy tree, and to be easily extensible.

Incremental building in Gulp is possible with plugins such as [gulp-newer](https://github.com/tschaub/gulp-newer) and [gulp-cached](https://github.com/wearefractal/gulp-cached), but these plugins have no way of handling dependencies between files. Correctly handling dependencies for incremental building is vital to projects using CSS preprocessors or javascript packaging systems, where the modification of an imported file should cause the whole bundle to be rebuilt.

#### Usage

The following is an example of an hypothetical [stylus](https://learnboost.github.io/stylus/) task.

```javascript
var cache  = require('gulp-cached');
var filter = require('gulp-filter');

// Your code here...

// Pass all files through the stream to be indexed
gulp.src("**/*.styl")
    // Prevent unchanged files from being indexed again
		.pipe(cache('styles'))
		// Insert gulp-walker here
		.pipe(walker())
	  // Filter the files in the stream to let
	  // through only the files that must be compiled
		.pipe(filter("**/app.styl"))
    // Do your normal compilation/bundling/processing
    // stuff here...
```
You can find a working example for a stylus + browserify + coffee environment [here](https://github.com/daniele-rapagnani/gulp-walker/blob/master/example/gulpfile.js).

#### Supported Languages
The following languages are actually supported but there are plans to support many more and you can easily implement your own finder.

* CoffeeScript
* JavaScript
* Stylus

#### How it works
The plugin builds the dependencies graph by analyzing the incoming files on the gulp stream. It does so by subdividing the analysis in two substeps: **finding** and **resolving**. In the **finding** step the plugin attempts to collect all the inclusion requests inside the source code being analyzed and returns them, unaltered, to the analyzer. The **resolving** step then tries to find the physical path of the file being requested by using a specific algorithm. To each of this steps one or more strategies can be assigned and **custom finders/resolvers** are easily implemented.

When one of the previously analyzed files is sent again through the stream, gulp-walker pushes all of its dependencies on the stream too to be processed. By using a plugin such as [gulp-filter](https://github.com/sindresorhus/gulp-filter) one can then select which files will actually proceed down the stream to be built (for example the app.css of the bundle including the modified file).

#### Similar projects
[gulp-progeny](https://github.com/HerringtonDarkholme/gulp-progeny)

## Documentation
You can find the documentation [here](https://github.com/daniele-rapagnani/gulp-walker/blob/master/docs/api.md)
