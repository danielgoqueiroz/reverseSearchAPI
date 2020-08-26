const puppeteer = require("puppeteer");
const fs = require("fs");

const URL_SIMILAR_WEB_SITE = "https://www.similarweb.com/pt/";

const INPUT_SEARCH_SELECTOR = "#js-swSearch-input";
const SEARCH_BUTTON_REQUEST_SELECTOR = "#js-swSearch-form > button";

const RESULTADO_TITULO_SELECTOR =
  "#rso > div:nth-child(INDEX) > div > div.r > a > h3";

async function run() {
  const browser = await await puppeteer.launch({
    headless: false,
  });

  try {
    const page = await browser.newPage();
    page.setExtraHTTPHeaders({
      "Accept-Charset": "utf-8",
      "accept-language": "pt-BR",
    });
    await page.goto(URL_SIMILAR_WEB_SITE);

    await page.waitFor(1000);

    await page.click(INPUT_SEARCH_SELECTOR);
    await page.waitFor(1000);
    await page.keyboard.type("ndmais.com.br");
    await page.press("Accept");

    await page.waitForNavigation();
  } catch (err) {
    console.log(err);
  }
  browser.close();
  console.log("Terminou");
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
    let data = await page.evaluate((sel) => {
      let element = document.querySelector(sel);
      return element ? element.innerHTML : element;
    }, data_selector);

    let resultPage = {
      titulo: titulo,
      imagem: imagem,
      link: link,
      data: data,
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

run();
