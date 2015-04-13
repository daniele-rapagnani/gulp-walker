## Information
**gulp-walker** is a gulp plugin that allows for dependencies aware incremental building.
It is conceived to scale well with big projects, with a complex dependecy tree, and to be easily extensible.

#### How it works
The plugin builds the dependencies graph by analyzing the incoming files on the gulp stream. It does so by subdividing the analysis in two substeps: **finding** and **resolving**. In the **finding** step the plugin attempts to collect all the inclusion requests inside the source code being analyzed and returns them, unaltered, to the analyzer. The **resolving** step then tries to find the physical path of the file being requested by using a specific algorithm. To each of this steps one or more strategies can be assigned and **custom finders/resolvers** are easily implemented.

#### Supported Languages
The following languages are actually supported but there are plans to support many more.

* CoffeeScript
* JavaScript
* Stylus

#### Similar projects
[gulp-progeny](https://github.com/HerringtonDarkholme/gulp-progeny)

## Usage
An example is provided to show how to setup a gulp+coffeeify+stylus environment.

## Documentation
You can find the documentation [here!](docs/api.md)
