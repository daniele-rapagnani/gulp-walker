## Classes
<dl>
<dt><a href="#Analyzer">Analyzer</a></dt>
<dd></dd>
<dt><a href="#FinderStrategy">FinderStrategy</a></dt>
<dd></dd>
<dt><a href="#RegexFinderStrategy">RegexFinderStrategy</a> ⇐ <code><a href="#FinderStrategy">FinderStrategy</a></code></dt>
<dd></dd>
<dt><a href="#BasicResolverStrategy">BasicResolverStrategy</a> ⇐ <code><a href="#ResolverStrategy">ResolverStrategy</a></code></dt>
<dd></dd>
<dt><a href="#CommonJSResolverStrategy">CommonJSResolverStrategy</a> ⇐ <code><a href="#BasicResolverStrategy">BasicResolverStrategy</a></code></dt>
<dd></dd>
<dt><a href="#ResolverStrategy">ResolverStrategy</a></dt>
<dd></dd>
</dl>
<a name="Analyzer"></a>
## Analyzer
**Kind**: global class  

* [Analyzer](#Analyzer)
  * [new Analyzer(config, state)](#new_Analyzer_new)
  * [.resolveDependencies(content, filePath)](#Analyzer#resolveDependencies) ⇒ <code>Array</code>
  * [.isUnprocessedFile(filePath)](#Analyzer#isUnprocessedFile) ⇒ <code>Boolean</code>
  * [.getDependencies(filePath)](#Analyzer#getDependencies) ⇒ <code>Array</code>
  * [.registerFileBase(The)](#Analyzer#registerFileBase)
  * [.getFileBase(filePath)](#Analyzer#getFileBase) ⇒

<a name="new_Analyzer_new"></a>
### new Analyzer(config, state)
The configuration of the analyzer has the followingstructure:<pre><code>{	finders: {		fileExt: [			{				name: 'finder-name',				config: {					// Finder configuration				}			}		],		fileExt2: [ 			//...		]	},		resolvers: {		fileExt: [			{				name: 'resolver-name',				config: {					// Resolver configuration				}			}		],		fileExt2: [ 			//...		]	}}</code></pre>If multiple resolvers/finders are specifiedtheir result will be aggregated.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The configuration of this		analyzer instance |
| state | <code>AnalyzerState</code> | The state to be used		in the analysis |

<a name="Analyzer#resolveDependencies"></a>
### analyzer.resolveDependencies(content, filePath) ⇒ <code>Array</code>
This method is the one performing the analysis:it finds the dependencies and resolves themon the filesystem according to the analyzer'sconfiguration.

**Kind**: instance method of <code>[Analyzer](#Analyzer)</code>  
**Returns**: <code>Array</code> - An array of all the files that should be		updated when the provided file changes  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>String</code> | The content of the file to be		analyzed by this finder. |
| filePath | <code>String</code> | The absolute path of the		file being analyzed. Can be used for debugging		purposes. |

<a name="Analyzer#isUnprocessedFile"></a>
### analyzer.isUnprocessedFile(filePath) ⇒ <code>Boolean</code>
Checks if the provided file was already processed.The information is extracted from this analyzer'sstate.

**Kind**: instance method of <code>[Analyzer](#Analyzer)</code>  
**Returns**: <code>Boolean</code> - True if the file was already		processed, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>String</code> | The absolute path		of the file to be tested |

<a name="Analyzer#getDependencies"></a>
### analyzer.getDependencies(filePath) ⇒ <code>Array</code>
Gets a list of the files that should be changedwhen the provided file changes.

**Kind**: instance method of <code>[Analyzer](#Analyzer)</code>  
**Returns**: <code>Array</code> - An array of absolute file paths  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>String</code> | The absolute path of the		file of which dependencies are wanted |

<a name="Analyzer#registerFileBase"></a>
### analyzer.registerFileBase(The)
Processed files bases must be saved because theydepend on the glob pattern used by the gulp task.The paths are then used to push the files backon the gulp stream.

**Kind**: instance method of <code>[Analyzer](#Analyzer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| The | <code>VinylFile</code> | vinyl file from which		the base will be extracted |

<a name="Analyzer#getFileBase"></a>
### analyzer.getFileBase(filePath) ⇒
Gets the base of a file as registered by[Analyzer.registerFileBase](Analyzer.registerFileBase).

**Kind**: instance method of <code>[Analyzer](#Analyzer)</code>  
**Returns**: The base for the provided file or false		if a base for this file was never registered  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>String</code> | The absolute path of the		file of which dependencies are wanted. |

<a name="FinderStrategy"></a>
## FinderStrategy
**Kind**: global class  

* [FinderStrategy](#FinderStrategy)
  * [new FinderStrategy(config)](#new_FinderStrategy_new)
  * _instance_
    * [.find(content, filePath)](#FinderStrategy#find) ⇒ <code>Array</code>
    * [.shouldIgnore(dependency)](#FinderStrategy#shouldIgnore) ⇒ <code>Boolean</code>
  * _static_
    * [.addFinder(name, finderClass)](#FinderStrategy.addFinder)
    * [.create(name, config)](#FinderStrategy.create) ⇒ <code>Object</code>

<a name="new_FinderStrategy_new"></a>
### new FinderStrategy(config)
By default finders accept the followingconfiguration:exclude: An array of inclusions to be ignored.			Useful for built-in libraries that			would not be resolved to any physical			file on the filesystem.This class also acts as registry of all dependencies finders.When a new finder is implemented it must be registeredwith this class, like this:<pre><code>FinderStrategy.addFinder('finder_name', YourFinderStrategy);</code></pre>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The configuraton to be used		by this strategy |

<a name="FinderStrategy#find"></a>
### finderStrategy.find(content, filePath) ⇒ <code>Array</code>
This method must be overrided with your own logic.

**Kind**: instance method of <code>[FinderStrategy](#FinderStrategy)</code>  
**Returns**: <code>Array</code> - An array of strings representing		the dependencies requested by the provided file.		The strings are as expressed and are not resolved		in any way at this stage.  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>String</code> | The content of the file to be		analyzed by this finder. |
| filePath | <code>String</code> | The absolute path of the		file being analyzed. Can be used for debugging		purposes. |

<a name="FinderStrategy#shouldIgnore"></a>
### finderStrategy.shouldIgnore(dependency) ⇒ <code>Boolean</code>
Checks if a given dependency should be ignoredbecause it was found in the excluded arrayprovided at configuration time.

**Kind**: instance method of <code>[FinderStrategy](#FinderStrategy)</code>  
**Returns**: <code>Boolean</code> - True if the dependency should be ignored		false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| dependency | <code>String</code> | The dependency to be		checked. |

<a name="FinderStrategy.addFinder"></a>
### FinderStrategy.addFinder(name, finderClass)
Register a new finder implementation underthe provided name.

**Kind**: static method of <code>[FinderStrategy](#FinderStrategy)</code>  
**Throws**:

- <code>PluginError</code> If a finder with the given		name already exists.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The with which this finder		will be registered. |
| finderClass | <code>function</code> | The finder class |

<a name="FinderStrategy.create"></a>
### FinderStrategy.create(name, config) ⇒ <code>Object</code>
Factory method to create a findergiven its name and a configuration

**Kind**: static method of <code>[FinderStrategy](#FinderStrategy)</code>  
**Returns**: <code>Object</code> - A new instance of the requested		finder  
**Throws**:

- <code>PluginError</code> If no finder with the		provided name could be found


| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the finder		to be instantiated. |
| config | <code>Object</code> | The configuration		with which it will be instantiated. |

<a name="RegexFinderStrategy"></a>
## RegexFinderStrategy ⇐ <code>[FinderStrategy](#FinderStrategy)</code>
**Extends:** <code>[FinderStrategy](#FinderStrategy)</code>  
**Kind**: global class  

* [RegexFinderStrategy](#RegexFinderStrategy) ⇐ <code>[FinderStrategy](#FinderStrategy)</code>
  * [new RegexFinderStrategy(config)](#new_RegexFinderStrategy_new)
  * [.find(content, filePath)](#RegexFinderStrategy#find) ⇒ <code>Array</code>
  * [.shouldIgnore(dependency)](#FinderStrategy#shouldIgnore) ⇒ <code>Boolean</code>

<a name="new_RegexFinderStrategy_new"></a>
### new RegexFinderStrategy(config)
In addition to the default configurationthis finder supports the followingconfiguration:pattern: The regex pattern that will		be used to find inclusions in source		code. The included file should be		captured by the first capture group		of the regex.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The configuration		of this finder strategy |

<a name="RegexFinderStrategy#find"></a>
### regexFinderStrategy.find(content, filePath) ⇒ <code>Array</code>
This is the actual method handling the analysis.The provided regex is executed against the file contentand all matches are collected and then returned.

**Kind**: instance method of <code>[RegexFinderStrategy](#RegexFinderStrategy)</code>  
**Overrides:** <code>[find](#FinderStrategy#find)</code>  
**Returns**: <code>Array</code> - An array of strings representing		the dependencies requested by the provided file.		The strings are as expressed and are not resolved		in any way at this stage.  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>String</code> | The content of the file to be		analyzed by this finder. |
| filePath | <code>String</code> | The absolute path of the		file being analyzed. Can be used for debugging		purposes. |

<a name="BasicResolverStrategy"></a>
## BasicResolverStrategy ⇐ <code>[ResolverStrategy](#ResolverStrategy)</code>
**Extends:** <code>[ResolverStrategy](#ResolverStrategy)</code>  
**Kind**: global class  

* [BasicResolverStrategy](#BasicResolverStrategy) ⇐ <code>[ResolverStrategy](#ResolverStrategy)</code>
  * [new BasicResolverStrategy(config)](#new_BasicResolverStrategy_new)
  * [.resolve(includerPath, filePath)](#BasicResolverStrategy#resolve) ⇒ <code>String</code>
  * [.guessFileExtension(absPath)](#BasicResolverStrategy#guessFileExtension) ⇒ <code>Array</code>
  * [.guessPaths(filePath, basePath)](#BasicResolverStrategy#guessPaths) ⇒
  * [.guessDirectoryIndex(absDirPath, dirPath)](#BasicResolverStrategy#guessDirectoryIndex) ⇒ <code>String</code>
  * [.getFirstExistingFile(absPaths)](#BasicResolverStrategy#getFirstExistingFile) ⇒ <code>String</code>

<a name="new_BasicResolverStrategy_new"></a>
### new BasicResolverStrategy(config)
This class implements a basic approach to path resolution that aims at being as flexibleas possible.For possible configuration values seethe documentation for the ResolverStrategy class.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>String</code> | The configuration of this							path resolver |

<a name="BasicResolverStrategy#resolve"></a>
### basicResolverStrategy.resolve(includerPath, filePath) ⇒ <code>String</code>
This function tries to guess the right file requestedby an inclusion by trying different combinations ofpaths, filenames and extensions.The included file can be relative to the including fileor absolute. This information may not be explicitly specified,for example by requiring a file simply by its name with nopath information.In case of absolute files the base paths specifiedat construction time are scanned for the requested file.When there is no way to determine if the requested pathis realtive or absolute, the file is first resolved as arelative path and then as an absolute path.The requeste file can also be with or without extension.If no extension is provided the extensions specifiedat construction time are used to guess the filename.If the requested path ends up being a directory, the functiontries to resolve the path by looking for an index file insidethe directory with the name provided in the configuration.

**Kind**: instance method of <code>[BasicResolverStrategy](#BasicResolverStrategy)</code>  
**Overrides:** <code>[resolve](#ResolverStrategy#resolve)</code>  
**Returns**: <code>String</code> - The absolute path on the filesystem of the included		file or null if the file was not found.  

| Param | Type | Description |
| --- | --- | --- |
| includerPath | <code>String</code> | The absolute path of the file		requesting the inclusion. |
| filePath | <code>String</code> | The path, as expressed in the include		expression of the source language, of the file to be included. |

<a name="BasicResolverStrategy#guessFileExtension"></a>
### basicResolverStrategy.guessFileExtension(absPath) ⇒ <code>Array</code>
Given an absolute path, the method returnsan array filled with a combination of theoriginal path with the extensions providedat configuration time.

**Kind**: instance method of <code>[BasicResolverStrategy](#BasicResolverStrategy)</code>  
**Returns**: <code>Array</code> - An array of possible file paths  

| Param | Type | Description |
| --- | --- | --- |
| absPath | <code>String</code> | The absolute path to an		extension-less file. |

<a name="BasicResolverStrategy#guessPaths"></a>
### basicResolverStrategy.guessPaths(filePath, basePath) ⇒
Given a base path and a relative path,an array is filled with all the combinationof the given path with the provided base pathand the base paths provided at configuration-time.

**Kind**: instance method of <code>[BasicResolverStrategy](#BasicResolverStrategy)</code>  
**Returns**: An array of possible paths  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>String</code> | The unaltered path to the file |
| basePath | <code>String</code> | The base path that will be used		to look for this file along with the ones in the		configuration. Usually the directory in which the		includer is. |

<a name="BasicResolverStrategy#guessDirectoryIndex"></a>
### basicResolverStrategy.guessDirectoryIndex(absDirPath, dirPath) ⇒ <code>String</code>
Given the absolute path to a directoryand the relative path to that directory,the method tries to guess the name ofthe index file to be included whenthe directory is included directly.

**Kind**: instance method of <code>[BasicResolverStrategy](#BasicResolverStrategy)</code>  
**Returns**: <code>String</code> - The relative path to the index file  

| Param | Type | Description |
| --- | --- | --- |
| absDirPath | <code>String</code> | The absolute path to a 		directory |
| dirPath | <code>String</code> | The path, as originally provided,		to the directory |

<a name="BasicResolverStrategy#getFirstExistingFile"></a>
### basicResolverStrategy.getFirstExistingFile(absPaths) ⇒ <code>String</code>
Checks a list of absolute pathsand returns the first one thatexists on filesystem.

**Kind**: instance method of <code>[BasicResolverStrategy](#BasicResolverStrategy)</code>  
**Returns**: <code>String</code> - The absolute path of a file on success, null			if none could be found  

| Param | Type | Description |
| --- | --- | --- |
| absPaths | <code>Array</code> | An array of absolute paths to		files. |

<a name="CommonJSResolverStrategy"></a>
## CommonJSResolverStrategy ⇐ <code>[BasicResolverStrategy](#BasicResolverStrategy)</code>
**Extends:** <code>[BasicResolverStrategy](#BasicResolverStrategy)</code>  
**Kind**: global class  

* [CommonJSResolverStrategy](#CommonJSResolverStrategy) ⇐ <code>[BasicResolverStrategy](#BasicResolverStrategy)</code>
  * [new CommonJSResolverStrategy(config)](#new_CommonJSResolverStrategy_new)
  * [.guessDirectoryIndex(absDirPath, dirPath)](#CommonJSResolverStrategy#guessDirectoryIndex) ⇒ <code>String</code>
  * [.resolve(includerPath, filePath)](#BasicResolverStrategy#resolve) ⇒ <code>String</code>
  * [.guessFileExtension(absPath)](#BasicResolverStrategy#guessFileExtension) ⇒ <code>Array</code>
  * [.guessPaths(filePath, basePath)](#BasicResolverStrategy#guessPaths) ⇒
  * [.getFirstExistingFile(absPaths)](#BasicResolverStrategy#getFirstExistingFile) ⇒ <code>String</code>

<a name="new_CommonJSResolverStrategy_new"></a>
### new CommonJSResolverStrategy(config)
A resolving strategy that supports CommonJS stylerequires, as seen in Node.js and Browserify.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | A configuration object. |

<a name="CommonJSResolverStrategy#guessDirectoryIndex"></a>
### commonJSResolverStrategy.guessDirectoryIndex(absDirPath, dirPath) ⇒ <code>String</code>
This method tries to locate the index file insidea module by reading its package.json file.If no package.json file is found, the methodfalls back to the parent's method.

**Kind**: instance method of <code>[CommonJSResolverStrategy](#CommonJSResolverStrategy)</code>  
**Overrides:** <code>[guessDirectoryIndex](#BasicResolverStrategy#guessDirectoryIndex)</code>  
**Returns**: <code>String</code> - The relative path to the index file  

| Param | Type | Description |
| --- | --- | --- |
| absDirPath | <code>String</code> | The absolute path to a 		directory |
| dirPath | <code>String</code> | The path, as originally provided,		to the directory |

<a name="ResolverStrategy"></a>
## ResolverStrategy
**Kind**: global class  

* [ResolverStrategy](#ResolverStrategy)
  * [new ResolverStrategy(config)](#new_ResolverStrategy_new)
  * _instance_
    * [.resolve(includerPath, filePath)](#ResolverStrategy#resolve) ⇒ <code>String</code>
  * _static_
    * [.addResolver(name, resolverClass)](#ResolverStrategy.addResolver)
    * [.create(name, config)](#ResolverStrategy.create) ⇒ <code>Object</code>

<a name="new_ResolverStrategy_new"></a>
### new ResolverStrategy(config)
By default resolvers accept the followingconfiguration:basePaths: An array of paths that will be used				to resolve absolute paths.extensions: An array of extensions that will be				appended to the original file name				if the file as it is could not be				located.indexFile: The name of the file to look for				if the included path is resolved				to a directory. The file will be				treated as a normal incoming path				so there is no need to specify an				extension.This class also acts as registry of all path resolvers.When a new resolver is implemented it must be registeredwith this class, like this:<pre><code>ResolverStrategy.addResolver('resolver_name', YourResolverStrategy);</code></pre>


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The configuraton to be used		by this strategy |

<a name="ResolverStrategy#resolve"></a>
### resolverStrategy.resolve(includerPath, filePath) ⇒ <code>String</code>
This method must be overrided with your own logic.

**Kind**: instance method of <code>[ResolverStrategy](#ResolverStrategy)</code>  
**Returns**: <code>String</code> - The absolute path on the filesystem of the included		file or null if the file was not found.  

| Param | Type | Description |
| --- | --- | --- |
| includerPath | <code>String</code> | The absolute path of the file		requesting the inclusion. |
| filePath | <code>String</code> | The path, as expressed in the include		expression of the source language, of the file to be included. |

<a name="ResolverStrategy.addResolver"></a>
### ResolverStrategy.addResolver(name, resolverClass)
Register a new resolver implementation underthe provided name.

**Kind**: static method of <code>[ResolverStrategy](#ResolverStrategy)</code>  
**Throws**:

- <code>PluginError</code> If a resolver with the given		name already exists.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The with which this resolver		will be registered. |
| resolverClass | <code>function</code> | The resolver class |

<a name="ResolverStrategy.create"></a>
### ResolverStrategy.create(name, config) ⇒ <code>Object</code>
Factory method to create a resolvergiven its name and a configuration

**Kind**: static method of <code>[ResolverStrategy](#ResolverStrategy)</code>  
**Returns**: <code>Object</code> - A new instance of the requested		resolver  
**Throws**:

- <code>PluginError</code> If no resolver with the		provided name could be found


| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the resolver		to be instantiated. |
| config | <code>Object</code> | The configuration		with which it will be instantiated. |

