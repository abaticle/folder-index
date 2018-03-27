const chokidar = require("chokidar");
const readdirp = require("readdirp");
const path = require("path");
const async = require("async");
const loki = require("lokijs");
const fs = require("fs");
const fuzzy = require('fuzzysort');
const _ = require("lodash");
const fileExtension = require("./file-extensions");

/**
 * Class Index
 */
let Index = function() {

    this._database = {};
    this._filesCollection = [];
    this._folders = [];    
    this._working = false;

};

/**
 * Initialize database and fill files collection
 * @param {*} parameters 
 */
Index.prototype.init = function(folders) {

    this._folders = folders;

    this._database = new loki("index.db", {
        autoload: true,
        autoloadCallback: this._databaseInitialize.bind(this),
        autosave: true,
        autosaveInterval: 4000,
        verbose: true
    });

};

/**
 * Update index content
 */
Index.prototype.update = function() {

    this._databaseInitialize((err, result) => {

        callback(err,result);

    });
};

/**
 * Get last "limit" files
 * @param {*} limit 
 */
Index.prototype.last = function(limit) {

    let searchResults = [];
    
    if (!this._working) {
        
        searchResults = this._filesCollection
            .chain()
            .simplesort("modificationTime", {
                desc: true
            })
            .limit(limit)
            .data();     

    }

    return searchResults;

};

/**
 * Watch directories for files changes
 */
Index.prototype._watch = function() {

    //And watch for changes
    let watcher = chokidar.watch(this.folders);

    watcher.on("ready", () => {
        console.log("Watching");

        watcher
            .on("add", (path, stats) => {   
                console.log("add: ", path);
                //return;
                this._filesCollection.insert(this._mapFileToCollection(path, stats));           
            })
            .on("change", (path, stats) => {
                console.log("change: ", path);
                
                this._filesCollection.findAndRemove({
                    "fullPath": path
                });

                this._filesCollection.insert(this._mapFileToCollection(path, stats));   
            })
            .on("unlink", (path, stats) => {
                console.log("delete: ", path);

                this._filesCollection.findAndRemove({
                    "fullPath": path
                });
            })
    });
}

/**
 * Search through files collection
 * @param {*} searchString 
 */
Index.prototype.search = function(searchString, limit) {

    let searchResults = [];

    if (!this._working) {

        if (typeof searchString === "String") {
            searchString = searchString.toLowerCase();
        }

        searchResults = this._filesCollection
            .chain()
            //.find({ "fileType" : "video" })
            .where((file) => {
                if (!searchString) return true;

                let searchResult = fuzzy.single(searchString, file.nameLowerCase);

                if (!searchResult) {
                    return false;
                } else {
                    file.score = searchResult.score;
                    file.invertScore = searchResult.score * -1;
                    return true;
                }       
            })
            .simplesort("invertScore")
            .limit(limit)
            .data();  

    }

    return searchResults; 

};

Index.prototype.getCollection = function() {
    return this._filesCollection;
}

/** 
 * Fill file collection
 */
Index.prototype._databaseInitialize = function(callback) {

    //Collection instance
    this._filesCollection = this._database.getCollection("files");

    if (this._filesCollection === null) {
        this._filesCollection = this._database.addCollection("files");
    }      

    
    //And if empty add files
    console.log("Initialize index");
    this._working = true;

    if (this._filesCollection.find().length === 0) {    
        
        this._fillFilesCollection((err, files) => {
            this._working = false;

            if (!err) {                
                console.log("Indexing done");
                this._watch();
            } else {
                callback(err, files);
                throw err;
            }
        });

    } else {
        this._working = false;
        console.log("Indexing already done");
        this._watch();
    }    
};

/**
 * Convert a file to put it in collection
 * @param {*} file 
 */
Index.prototype._mapFileToCollection = function(fullPath, stats) {

    let extension = _.last(fullPath.split("."));
    let fileType = _.first(fileExtension.ext.getContentType(extension));
    
    return {
        name: _.last(fullPath.split(path.sep)),
        nameLowerCase: _.last(fullPath.split(path.sep)).toLowerCase(),
        fullPath: fullPath,
        fullPathLowerCase: fullPath.toLowerCase(),
        modificationTime: stats.mtime.getTime(),
        size:  stats.size,
        extension: extension,
        fileType: fileType
    };

};

/**
 * Fill files collection
 * @param {*} callback 
 */
Index.prototype._fillFilesCollection = function(callback) {

    /**
     * Get files from a folder
     */
    getFilesFromFolder = function(folder, callback){    
        console.log("Get files from ", folder);

        readdirp({ root: folder }, (err,result) => {
            callback(err, result.files);
        });
    };

    async.concatSeries(this._folders, getFilesFromFolder, (err, files) => {
        
        let collection = [];

        _.each(files, file => {
            collection.push(this._mapFileToCollection(file.fullPath, file.stat));
        })

        this._filesCollection.insert(collection);
        this._database.saveDatabase();

        callback(err, files);
    });

};

module.exports = new Index();