const puppeteer = require("puppeteer");
const querystring = require("querystring");
const { validate } = require("../helper/utils");
const util = require("../helper/utils");

const URL_GOOGLE_IMAGE_SEARCH = "https://www.google.com/imghp?hl=pt-BR";
const BUTTON_SEARCH_SELECTOR = "#sbtc > div > div.dRYYxd > div.LM8x9c";
const INPUT_SEARCH_SELECTOR = "#sbtc > div > div.a4bIc > input";
const SEARCH_BUTTON_REQUEST_SELECTOR = "#RZJ9Ub";
const SELECTOR_NAVIGATORS_NEXT = "#pnnext";
const COUNTER_SELECTOR = "g";

async function search(link) {
  console.log("Iniciando");
  const browser = await await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: false,
  });

  try {
    let page = await browser.newPage();
    page.setExtraHTTPHeaders({
      "Accept-Charset": "utf-8",
      "accept-language": "pt-BR",
    });

    page = await buscaReversaEmLinkDeImagem(browser, link);

    let resultados = await extraiInformacoesDaPagina(page);

    while (await existetemProximaPagina(page)) {
      console.log("Proxima página");
      await page.click(SELECTOR_NAVIGATORS_NEXT);
      await page.waitForNavigation({
        timeout: 3600,
        waitUntil: "domcontentloaded",
      });
      let resultsPage = await extraiInformacoesDaPagina(page);

      resultados = resultados.concat(resultsPage);
    }
    const resultApi = {
      link: link,
      hash: util.getHash(link),
      results: resultados,
    };
    return resultApi;
  } catch (err) {
    console.log(err);
    return {
      erro: "Erro ao realizar busca",
      mensagem: err,
    };
  } finally {
    console.log("Terminando");
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
  let contentHandles = await page.$x('//*[@class="g"]');
  let results = [];

  const promisses = await contentHandles.map(async (handler, index) => {
    let list = [];
    let cite = await page.evaluate(
      (el) => el.querySelector("cite").innerText,
      handler
    );
    let img = await page.evaluate(
      (el) => el.querySelector("img")?.src,
      handler
    );
    let h3 = await page.evaluate(
      (el) => el.querySelector("h3").innerText,
      handler
    );
    let a = await page.evaluate((el) => el.querySelector("a")?.href, handler);

    let text = await page.evaluate(
      (el) => el.innerText.replace(/(\r\n|\n|\r)/gm, ""),
      handler
    );
    if (img && a) {
      const result = {
        link: cite,
        preview: img,
        title: h3,
        text: text,
        host: new URL(a).host,
      };
      results.push(result);
    }
  });
  await Promise.all(promisses);

  console.log(results);

  return results;
}

async function buscaReversaEmLinkDeImagem(browser, link) {
  const page = await browser.newPage();
  page.setExtraHTTPHeaders({
    "Accept-Charset": "utf-8",
    "accept-language": "pt-BR",
  });
  await page.goto(URL_GOOGLE_IMAGE_SEARCH);

  await page.waitFor("#sbtc > div > div.dRYYxd > div.ZaFQO > span");

  await page.click("#sbtc > div > div.dRYYxd > div.ZaFQO > span");
  await page.waitForSelector("#Ycyxxc");
  await page.click("#Ycyxxc");
  await page.keyboard.type(link);

  await page.click(SEARCH_BUTTON_REQUEST_SELECTOR);
  await page.waitForNavigation();
  return page;
}

module.exports.search = search;
