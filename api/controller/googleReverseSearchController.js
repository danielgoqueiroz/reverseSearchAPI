const puppeteer = require("puppeteer");
const querystring = require("querystring");

const URL_GOOGLE_IMAGE_SEARCH = "https://www.google.com/imghp?hl=pt-BR";

const BUTTON_SEARCH_SELECTOR = "#sbtc > div > div.dRYYxd > div.LM8x9c";
const INPUT_SEARCH_SELECTOR = "#Ycyxxc";
const SEARCH_BUTTON_REQUEST_SELECTOR = "#RZJ9Ub";

const SELECTOR_NAVIGATORS_NEXT = "#pnnext";

const COUNTER_SELECTOR = "g";

async function search(link) {
  console.log("Iniciando");
  const browser = await await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  try {
    let page = await browser.newPage();
    page.setExtraHTTPHeaders({
      "Accept-Charset": "utf-8",
      "accept-language": "pt-BR",
    });

    // await page.goto(link);
    // await page.waitFor(1000);

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

    // let resultGrouped = resultados.reduce(function (r, a) {
    //   r[a.host] = r[a.host] || [];
    //   r[a.host].push(a);
    //   return r;
    // }, Object.create(null));

    // let resultPageComplete = {
    //   link: link,
    //   results: resultGrouped,
    // };

    return resultados;
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
  const result = await page.evaluate(() => {
    let gElements = document.getElementsByClassName("g");

    if (gElements === undefined) {
      return;
    }

    let resultsPages = [];
    for (let index = 0; index < gElements.length; index++) {
      console.log(index);
      let element = gElements[index];
      if (element.getElementsByTagName("a")[0].href !== undefined) {
        const link = element.getElementsByTagName("a")[0].href;
        if (link.length > 0) {
          const text =
            element.lastElementChild.lastElementChild.lastElementChild.getElementsByClassName(
              "aCOpRe"
            )[0].textContent;
          console.log(link);
          const host = new URL(link).host;

          resultsPages.push({
            host: host,
            link: link,
            text: text,
          });
        }
      }
    }
    return resultsPages;
  });

  return result;
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
