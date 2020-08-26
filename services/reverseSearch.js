const puppeteer = require("puppeteer");

const URL_GOOGLE_IMAGE_SEARCH = "https://www.google.com/imghp?hl=pt-BR";

const BUTTON_SEARCH_SELECTOR = "#sbtc > div > div.dRYYxd > div.LM8x9c";
const INPUT_SEARCH_SELECTOR = "#Ycyxxc";
const SEARCH_BUTTON_REQUEST_SELECTOR = "#aoghAf > input";

const RESULTADO_TITULO_SELECTOR =
  "#rso > div:nth-child(INDEX) > div > div.r > a > h3";
const RESULTADO_LINK_CONTEUDO = "#rso > div:nth-child(INDEX) > div > div.r > a";
const RESULTADO_DATA_CONTEUDO =
  "#rso > div:nth-child(INDEX) > div > div.s > div:nth-child(2) > span > span";
const RESULTADO_IMAGEM_SELECTOR =
  "#rso > div:nth-child(INDEX) > div > div.s > div:nth-child(1) > div > a";
const SELECTOR_NAVIGATORS_NEXT = "#pnnext";

const COUNTER_SELECTOR = "g";

async function search(link) {
  const browser = await await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await buscaReversaEmLinkDeImagem(browser, link);
    let resultados = await extraiInformacoesDaPagina(page);
    while (await existetemProximaPagina(page)) {
      await page.click(SELECTOR_NAVIGATORS_NEXT);
      await page.waitForNavigation();
      let resultsPage = await extraiInformacoesDaPagina(page);
      resultados = resultados.concat(resultsPage);
    }
    return resultados;
  } catch (err) {
    console.log(err);
    return {
      erro: "Erro ao realizar busca",
      mensagem: err,
    };
  } finally {
    browser.close();
  }
}

async function existetemProximaPagina(page) {
  return await page.evaluate((sel) => {
    let element = document.querySelector(sel);
    return element !== null && element !== undefined;
  }, SELECTOR_NAVIGATORS_NEXT);
}

async function extraiInformacoesDaPagina(page) {
  let resultsPages = [];
  let listLength = await extraiQuantidadeDeResultados(page);
  for (let i = 0; i < listLength + 5; i++) {
    let titulo_selector = RESULTADO_TITULO_SELECTOR.replace("INDEX", i);
    let titulo = await page.evaluate((sel) => {
      let element = document.querySelector(sel);
      return element ? element.innerHTML : element;
    }, titulo_selector);

    let imagem_selector = RESULTADO_IMAGEM_SELECTOR.replace("INDEX", i);
    let imagem = await page.evaluate((sel) => {
      let element = document.querySelector(sel);
      return element ? element.getAttribute("href") : element;
    }, imagem_selector);

    let link_selector = RESULTADO_LINK_CONTEUDO.replace("INDEX", i);
    let link = await page.evaluate((sel) => {
      let element = document.querySelector(sel);
      return element ? element.getAttribute("href") : element;
    }, link_selector);

    let data_selector = RESULTADO_DATA_CONTEUDO.replace("INDEX", i);
    let dataRaw = await page.evaluate((sel) => {
      let element = document.querySelector(sel);
      return element ? element.innerHTML : element;
    }, data_selector);

    let size = "";
    let data = "";
    if (dataRaw != null) {
      let dataRawSplited = dataRaw.split(" - ");
      if (dataRawSplited[0]) {
        size = dataRawSplited[0];
      }
      if (dataRawSplited[1]) {
        data = dataRawSplited[1];
      }
    }

    let resultPage = {
      titulo: titulo,
      imagem: imagem,
      link: link,
      data: data,
      size: size,
    };

    if (ehResultadoValido(resultPage)) {
      resultsPages.push(resultPage);
    }
  }
  return resultsPages;
}

function ehResultadoValido(resultado) {
  return !(
    resultado.titulo == null ||
    resultado.imagem == null ||
    resultado.link == null
  );
}

async function extraiQuantidadeDeResultados(page) {
  let listLength = await page.evaluate((sel) => {
    return document.getElementsByClassName(sel).length;
  }, COUNTER_SELECTOR);
  console.log(listLength);
  return listLength;
}

async function buscaReversaEmLinkDeImagem(browser, link) {
  const page = await browser.newPage();
  page.setExtraHTTPHeaders({
    "Accept-Charset": "utf-8",
    "accept-language": "pt-BR",
  });
  await page.goto(URL_GOOGLE_IMAGE_SEARCH);

  await page.waitFor(1000);

  await page.click(BUTTON_SEARCH_SELECTOR);
  await page.waitForSelector(INPUT_SEARCH_SELECTOR);
  await page.click(INPUT_SEARCH_SELECTOR);
  await page.keyboard.type(link);

  await page.click(SEARCH_BUTTON_REQUEST_SELECTOR);
  await page.waitForNavigation();
  return page;
}

module.exports.search = search;
