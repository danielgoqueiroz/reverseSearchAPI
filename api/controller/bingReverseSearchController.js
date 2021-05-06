const puppeteer = require("puppeteer");
const querystring = require("querystring");

const URL_BING_IMAGE_SEARCH = "https://www.bing.com/visualsearch";

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

  let listLength = await extraiQuantidadeDeResultados(page);

  const html = await page.evaluate((sel) => {
    return document.getElementsByClassName(sel);
  }, COUNTER_SELECTOR);

  console.log(html)

  for (let i = 1; i < listLength + 5; i++) {
    console.log(`Buscando item ${i}`);
    let imagem_selector = RESULTADO_IMAGEM_SELECTOR.replace("INDEX", i);
    let imagem = await page.evaluate((sel) => {
      let element = document.querySelector(sel);
      return element ? element.getAttribute("href") : element;
    }, imagem_selector);
    console.log(`Imagem: ${imagem}`);
    if (imagem != null) {
      let imagemLink = querystring.parse(imagem.split("?")[1]);
      let imagemLinkToSave = imagemLink.imgurl;
      let titulo_selector = RESULTADO_TITULO_SELECTOR.replace("INDEX", i);
      let titulo = await page.evaluate((sel) => {
        let element = document.querySelector(sel);
        return element ? element.innerHTML : element;
      }, titulo_selector);

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
        let dataRawSplited = dataRaw.split(" · ");
        if (dataRawSplited[1]) {
          data = dataRawSplited[1];
          data = data.replace(" — ", "");
        }
        if (dataRawSplited[0]) {
          size = dataRawSplited[0];
        }
      }
      let resultPage = {
        title: titulo,
        image: imagemLinkToSave,
        page: link,
        date: data,
        size: size,
      };
      console.log("-");
      console.log(resultPage);

      if (ehResultadoValido(resultPage)) {
        resultsPages.push(resultPage);
      }
    }
  }

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
  await page.goto("https://www.bing.com/visualsearch");

  await page.waitFor(1000);

  await page.click("#vsk_pastepn");
  await page.keyboard.type(link);
  await page.keyboard.press('Enter');
  await page.click("#detailCanvas > div.insights > div > div.tab-head > div > ul > li.t-pim.nofocus > span > span.text")
  await page.waitFor(10000)
  await page.waitForNavigation();
  return page;
}

search('https://noticias.reclameaqui.com.br/uploads/403348113.jpg')

// module.exports.search = search;
