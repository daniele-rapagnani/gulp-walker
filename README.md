## Information
**gulp-walker** is a gulp plugin that allows for dependencies aware incremental building.
It is conceived to scale well with big projects, with a complex dependecy tree, and to be easily extensible.

Incremental building in Gulp is possible with plugins such as [gulp-newer](https://github.com/tschaub/gulp-newer) and [gulp-cached](https://github.com/wearefractal/gulp-cached), but these plugins have no way of handling dependencies between files. Correctly handling dependencies for incremental building is vital to projects using CSS preprocessors or javascript packaging systems, where the modification of an imported file should cause the whole bundle to be rebuilt.

#### How it works
The plugin builds the dependencies graph by analyzing the incoming files on the gulp stream. It does so by subdividing the analysis in two substeps: **finding** and **resolving**. In the **finding** step the plugin attempts to collect all the inclusion requests inside the source code being analyzed and returns them, unaltered, to the analyzer. The **resolving** step then tries to find the physical path of the file being requested by using a specific algorithm. To each of this steps one or more strategies can be assigned and **custom finders/resolvers** are easily implemented.

When one of the previously analyzed files is sent again through the stream, gulp-walker pushes all of its dependencies on the stream too to be processed. By using a plugin such as [gulp-filter](https://github.com/sindresorhus/gulp-filter) one can then select which files will actually proceed down the stream to be built (for example the app.css of the bundle including the modified file).

#### Supported Languages
The following languages are actually supported but there are plans to support many more and you can easily implement your own finder.

* CoffeeScript
* JavaScript
* Stylus

#### Similar projects
[gulp-progeny](https://github.com/HerringtonDarkholme/gulp-progeny)

## Usage
An example is provided to show how to setup a gulp+coffeeify+stylus environment.

## Documentation
You can find the documentation [here](docs/api.md)
