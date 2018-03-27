# folder-index
Index files using Lokijs

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

Just copy the content of the repository and launch server.js 

To initialize a database :
```
const fileIndex = require("./file-index.js");

fileIndex.init(["/path/to/my/folder", "/path/to/an/other/folder"]);
```

To retrieve first 20 files using fuzzy sort
```
fileIndex.search("my query", 20);
```

To retrieve the last 10 files modified
```
fileIndex.last(10)
```

## Built With

* [LokiJS](http://lokijs.org) - In-memory document-oriented datastore for node.js
* [Chokidar](https://maven.apache.org/) - A neat wrapper around node.js fs.watch / fs.watchFile / fsevents

## Authors

* **Alexandre Baticle** - [abaticle](https://github.com/abaticle)