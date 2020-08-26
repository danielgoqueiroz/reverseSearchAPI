const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = 3000;
Cache = require("cache");
cache = new Cache(100 * 1000); // Create a cache with 10 second TTL
const fs = require("fs");
var crypto = require("crypto");
const md5sum = crypto.createHash("md5");

const reverseSearch = require("./services/reverseSearch");

app.get("/", (req, res) => {
  res.status(200).send("Api funcionando");
});

app.get("/reverseSearch", async (req, res) => {
  let link = req.query.url;
  let localData = cache.get(link);

  if (localData == null) {
    console.log("Realizando crawler");
    await reverseSearch.search(link).then((response) => {
      cache.put(link, JSON.stringify(response));
      var hash = crypto.createHash("md5").update(link).digest("hex");
      fs.writeFile(`json/${hash}.json`, JSON.stringify(response), function (
        err
      ) {
        if (err) throw err;
        console.log("json salvo!");
      });
      res.status(200).send(response);
    });
  } else {
    console.log("Resultado do cache");
    res.status(200).send(JSON.parse(localData));
  }
});

// Run server
server.listen(port, () => {
  console.log(`Iniciando API de Crawler na porta[${port}]`);
});
