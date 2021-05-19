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

const cors = require("cors");
const { json } = require("express");
const reverseSearch = require("./api/controller/googleReverseSearchController");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

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

//Search reult saved
app.delete("/reverseSearch/result", (req, res) => {
  let hash = req.query.hash;
  if (hash != undefined && hash.length > 5) {
    const jsonPath = `api/resources/json/${hash}.json`;
    fs.unlink(jsonPath, (err) => {
      if (err) {
        return res
          .send({ message: "Erro ao remover json", hash: hash })
          .status(403);
      }
    });
    return res.status(201).send({ message: "Iten removido", hash: hash });
  } else {
    return res.send({ message: "Hash inválido" }).status(403);
  }
});

//List os searchs
app.get("/reverseSearch/results", (req, res) => {
  let hash = req.query.hash;
  if (hash != undefined && hash.length > 5) {
    const jsonPath = `api/resources/json/${hash}.json`;
    if (fs.existsSync(jsonPath)) {
      let json = JSON.parse(fs.readFileSync(jsonPath));
      return res.send(json).status(200);
    } else {
      return res.send({ error: "Dado não encontrado" }).status(401);
    }
  }
  let jsons = [];

  fs.readdirSync("api/resources/json/").forEach((file) => {
    try {
      let json = JSON.parse(fs.readFileSync(`api/resources/json/${file}`));
      jsons.push(json);
    } catch (err) {
      console.log("Registro inconsistente");
    }
  });

  return res.send(jsons).status(200);
});

app.get("/reverseSearch/search", async (req, res) => {
  let link = null;

  try {
    // const email = req.query.email;
    // if (
    //   email === undefined ||
    //   email === null ||
    //   !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    //     email
    //   )
    // ) {
    //   return res.status(403).send({ message: `E-mail inválido:${email} ` });
    // }
    link = new URL(req.query.url);
  } catch (_) {
    res.status(403).send({ error: "Url inválida" });
  }

  var linkHash = crypto.createHash("md5").update(link.toString()).digest("hex");
  const jsonPath = `api/resources/json/${linkHash}.json`;

  if (fs.existsSync(jsonPath)) {
    console.log("Dado carregado do histórico");
    const jsonLocal = JSON.parse(fs.readFileSync(jsonPath));
    return res.status(200).send(jsonLocal);
  }

  let localData = cache.get(linkHash);

  if (localData == null) {
    console.log(`Realizando crawler de : ${link}`);
    await reverseSearch.search(link.toString()).then((response) => {
      response.hash = linkHash;
      cache.put(linkHash, JSON.stringify(response));
      //Write json
      fs.writeFile(jsonPath, JSON.stringify(response), function (err) {
        if (err) throw err;
        console.log(`Json salvo: ${jsonPath}`);
      });
      nodemailer.res.status(200).send(response);
    });
  } else {
    console.log("Resultado carregado do cache.");
    response.hash = linkHash;
    res.status(200).send(JSON.parse(localData));
  }
});

//Find imagens from author
app.get("/findImagesLinksFromSiteFromAuthor", (req, res) => {
  let author = req.query.author;
  let site = req.query.site;
  // crawler bing por resultados
  // crawler google por resultados
  // yandex site:ndmais.com.br "daniel queiroz"
  // https://br.images.search.yahoo.com/
  res.status(200).send("Api funcionando");
});

// Run server
server.listen(process.env.PORT || port, () => {
  console.log(`Iniciando API de Crawler na porta[${port}]`);
});
