# folder-index
Index files using Lokijs

## Installing

Using npm :
```
npm install
npm start
```


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