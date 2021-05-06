const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = 3000;
Cache = require("cache");
const cache = new Cache(100 * 1000); // Create a cache with 10 second TTL
const fs = require("fs");
var crypto = require("crypto");
const md5sum = crypto.createHash("md5");

const reverseSearch = require("./api/controller/googleReverseSearchController");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const cors = require("cors");
app.use((req, res, next) => {
  //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
  res.header("Access-Control-Allow-Origin", "*");
  //Quais são os métodos que a conexão pode realizar na API
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  app.use(cors());
  next();
});

app.get("/", (req, res) => {
  res.status(200).send("Api funcionando");
});

app.get("/reverseSearch", async (req, res) => {
  let link = req.query.url;
  console.log(link)
  let localData = cache.get(link);

  if (localData == null) {
    console.log("Realizando crawler");
    await reverseSearch.search(link).then((response) => {
      cache.put(link, JSON.stringify(response));
      var hash = crypto.createHash("md5").update(link).digest("hex");
      fs.writeFile(
        `api/resources/json/${hash}.json`,
        JSON.stringify(response),
        function (err) {
          if (err) throw err;
          console.log("json salvo!");
        }
      );
      console.log(response);
      res.status(200).send(response);
    });
  } else {
    console.log("Resultado do cache");
    res.status(200).send(JSON.parse(localData));
  }
});

// Run server
server.listen(process.env.PORT || port, () => {
  console.log(`Iniciando API de Crawler na porta[${port}]`);
});
