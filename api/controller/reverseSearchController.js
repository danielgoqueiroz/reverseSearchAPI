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
    headless: false,
  });

  try {
    const page = await buscaReversaEmLinkDeImagem(browser, link);
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
  let resultsPages = [];

  let gAreas = await page.evaluate((sel) => {
    const gElements = document.getElementsByClassName(sel);
    console.log(gElements);
    // for (let index = 0; index < gElements.length; index++) {
    //   const gElement = gElements[index];
    //   const innectTextgElement.innerText,
    //   gElement;
    // }
    return gElements;
  }, "g");

  // for (let i = 1; i < gAreas.length; i++) {
  //   console.log(`Buscando item ${i}`);

  //   console.log(gArea[i].innerText());

  //   let imagem_selector = RESULTADO_IMAGEM_SELECTOR.replace("INDEX", i);
  //   let imagem = await page.evaluate((sel) => {
  //     const gS = document.querySelector(sel);
  //     return element;
  //   }, imagem_selector);

  //   if (imagem === null) {
  //     return;
  //   } else {
  //     console.log(imagem);
  //     let imagemLink = querystring.parse(imagem.split("?")[1]);
  //     let imagemLinkToSave = imagemLink.imgurl;
  //     let titulo_selector = RESULTADO_TITULO_SELECTOR.replace("INDEX", i);
  //     let titulo = await page.evaluate((sel) => {
  //       let element = document.querySelector(sel);
  //       return element ? element.innerHTML : element;
  //     }, titulo_selector);

  //     let link_selector = RESULTADO_LINK_CONTEUDO.replace("INDEX", i);
  //     let link = await page.evaluate((sel) => {
  //       let element = document.querySelector(sel);
  //       return element ? element.getAttribute("href") : element;
  //     }, link_selector);

  //     let data_selector = RESULTADO_DATA_CONTEUDO.replace("INDEX", i);
  //     let dataRaw = await page.evaluate((sel) => {
  //       let element = document.querySelector(sel);
  //       return element ? element.innerHTML : element;
  //     }, data_selector);

  //     let size = "";
  //     let data = "";
  //     if (dataRaw != null) {
  //       let dataRawSplited = dataRaw.split(" · ");
  //       if (dataRawSplited[1]) {
  //         data = dataRawSplited[1];
  //         data = data.replace(" — ", "");
  //       }
  //       if (dataRawSplited[0]) {
  //         size = dataRawSplited[0];
  //       }
  //     }
  //     let resultPage = {
  //       title: titulo,
  //       image: imagemLinkToSave,
  //       page: link,
  //       date: data,
  //       size: size,
  //     };
  //     console.log("-");
  //     console.log(resultPage);

  //     if (ehResultadoValido(resultPage)) {
  //       resultsPages.push(resultPage);
  //     }
  // }
  // }

  return resultsPages;
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

(async) =>
  await extraiInformacoesDaPagina(
    "https://okafala.files.wordpress.com/2014/08/virgin-virgo-new-moon-conjunct-sun.jpg"
  );

// module.exports.search = search;
