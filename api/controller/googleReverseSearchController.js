const puppeteer = require("puppeteer");
const querystring = require("querystring");

const URL_GOOGLE_IMAGE_SEARCH = "https://www.google.com/imghp?hl=pt-BR";

const BUTTON_SEARCH_SELECTOR = "#sbtc > div > div.dRYYxd > div.LM8x9c";
const INPUT_SEARCH_SELECTOR = "#Ycyxxc";
const SEARCH_BUTTON_REQUEST_SELECTOR = "#RZJ9Ub";

const RESULTADO_TITULO_SELECTOR =
  "#rso > div:nth-child(2) > div:nth-child(INDEX) > div > div > div.yuRUbf > a > h3";
const RESULTADO_LINK_CONTEUDO =
  "#rso > div:nth-child(2) > div:nth-child(INDEX) > div > div > div.yuRUbf > a";
const RESULTADO_DATA_CONTEUDO =
  "#rso > div:nth-child(2) > div:nth-child(INDEX) > div > div > div.IsZvec > div:nth-child(2) > span > span.f";
const RESULTADO_IMAGEM_SELECTOR =
  "#rso > div > div:nth-child(INDEX) > div > div > div.IsZvec > div:nth-child(1) > div";
const SELECTOR_NAVIGATORS_NEXT = "#pnnext";

const COUNTER_SELECTOR = "g";

async function search(link) {
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
      await page.click(SELECTOR_NAVIGATORS_NEXT);
      await page.waitForNavigation({
        timeout: 3600,
        waitUntil: "domcontentloaded",
      });
      let resultsPage = await extraiInformacoesDaPagina(page);
      resultados = resultados.concat(resultsPage);
    }

    let resultPageComplete = {
      link: link,
      results: resultados,
    };

    return resultPageComplete;
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
  const result = await page.evaluate(() => {
    let gElements = document.getElementsByClassName("g");

    let resultsPages = [];

    for (let index = 0; index < gElements.length; index++) {
      let element = gElements[index];
      if (element.getElementsByTagName("a")[0].href !== undefined) {
        const link = element.getElementsByTagName("a")[0].href;
        const text = element.lastElementChild.lastElementChild.lastElementChild.getElementsByClassName(
          "aCOpRe"
        )[0].textContent;

        resultsPages.push({
          link: link,
          text: text,
        });
      }
    }
    return resultsPages;
  });

  return result;
}

function ehResultadoValido(resultado) {
  return !(
    resultado.title == null ||
    resultado.image == null ||
    resultado.page == null
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

// search(
//   "https://www.google.com/search?tbs=sbi:AMhZZiseloeskfN2Yl1j4kOSmZ2FRNbH58uLlTsdkEd1-CfwCSvLbaTJzJ1EWQl8e2OQftahgZfqR4gLiV89xRC5whI8qcV4n6UIJyiU4fZnS3Q4YGey0qEu5ZJBUMkIh2rcJZV5DjXHJG1Ds1pHWeiKCbOr9IZaBbvq3bxG3EVK-gTruaTJsECdRST8DFHrPQguD1nScDLSU9CeIElpKy5K7ln3kOzOjD2eyj2I0n3fVcvV18OWrfWzKja3IplQkxGjCSPcNMl81bIzyON8OfQKgD4xPr_1P9nm8YdIxWwBnjmhrKJ4pIgXvSNMMoj8uuLWva1jGENKSmZcs0mZihX5Ce3SPc8omJTc4AWqpSiTQkg_1AfI2Z0gRGTgSk2jQFUtLzHD_1UD2ww"
// );

module.exports.search = search;
