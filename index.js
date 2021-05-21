const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = 3000;
const fs = require("fs");
var crypto = require("crypto");
const md5sum = crypto.createHash("md5");
const utils = require("./api/helper/utils");
const cors = require("cors");
const { json } = require("express");
const reverseSearch = require("./api/controller/googleReverseSearchController");
const mail = require("./api/controller/emailController");
const csv = require("./api/controller/csvController");
const CONST = require("./api/helper/Consts");

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

//Remove
app.delete("/reverseSearch/result", (req, res) => {
  const hash = req.query.hash;
  const email = req.query.email;

  if (!utils.isEmailValid(email)) {
    return res.status(403).send({ message: "Email inválido." });
  }

  const basePath = `${CONST.JSON_PATH}/${emailHash}`;

  if (hash != undefined && hash.length > 5) {
    const jsonPath = `${basePath}/${hash}.json`;
    if (!fs.existsSync(jsonPath)) {
      return res.status(403).send({ message: "Arquivo não encontrado" });
    }
    fs.unlink(jsonPath, (err) => {
      if (err) {
        return res.send({ message: "Erro ao remover o item." }).status(403);
      } else {
        return res.status(201).send({ message: "Iten removido", hash: hash });
      }
    });
  } else {
    return res.send({ message: "Hash inválido" }).status(403);
  }
});

//List os searchs from a e-mail
app.get("/reverseSearch/results", (req, res) => {
  const email = req.query.email;
  const emailHash = utils.getHash(email);

  if (!utils.isEmailValid) {
    return res.status(403).send({ message: "Email informado inválido." });
  }

  const basePath = `${CONST.JSON_PATH}/${emailHash}`;

  let jsons = [];

  fs.readdirSync(basePath).forEach((file) => {
    try {
      const json = JSON.parse(fs.readFileSync(`${basePath}/${file}`));
      jsons.push(json);
    } catch (err) {
      console.log("Registro inconsistente");
    }
  });

  return res.send(jsons).status(200);
});

//Get specific result
app.get("/reverseSearch/search", async (req, res) => {
  const link = req.query.url;
  const email = req.query.email;

  if (!utils.isLinkValid(link)) {
    return res.status(403).send({ message: "Link inválido" });
  }
  if (!utils.isEmailValid(email)) {
    return res.status(403).send({ message: "E-mail inválido" });
  }

  const linkHash = utils.getHash(link);
  const emailHash = utils.getHash(email);

  const basePath = `${CONST.JSON_PATH}/${emailHash}`;
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath);
  }

  const jsonPath = `${basePath}/${linkHash}.json`;
  const jsonContent = utils.readFile(jsonPath);

  if (!fs.existsSync(jsonPath)) {
    console.log(`Realizando crawler de : ${link}`);
    await reverseSearch.search(link.toString()).then((response) => {
      //Write json
      fs.writeFileSync(jsonPath, JSON.stringify(response), function (err) {
        if (err) {
          res
            .status(403)
            .send({ message: "Erro ao salvar resultado: ", erro: err });
        }
      });
      mail.sendMail(
        email,
        `Resultado de pesquisa (${linkHash})`,
        "Resultado de pesquisa em anexo. ",
        {
          filename: `${linkHash}.csv`,
          content: JSON.stringify(csv.jsontoCsv(response.results)),
        }
      );

      return res.status(200).send(response);
    });
  } else {
    res.status(200).send(jsonContent);
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
  console.log(`Crawler iniciado na porta[${port}]`);
});
