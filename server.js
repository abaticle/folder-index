const fileIndex = require("./file-index.js");
const express = require("express");
const app = express();

const PORT = 8080;
const HOST = '0.0.0.0';

fileIndex.init([
    "/volume1",
    "/volume2",
    "/volume3",
    "/volume4"
]);

app.get("/search", (req, res) => {
    res.send(JSON.stringify(fileIndex.search(req.query.s, 200)));
});

app.get("/last", (req, res) => {
    res.send(JSON.stringify(fileIndex.last(10)));
});

app.listen(PORT, HOST);

console.log(`Running on http://${HOST}:${PORT}`);

