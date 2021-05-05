const puppeteer = require("puppeteer");
const fs = require("fs");

const URL_SIMILAR_WEB_SITE = "https://www.similarweb.com/pt/website/";

const RESULTADO_CLASS = "engagementInfo-valueNumber";

async function search() {
  const url = new URL(
    "https://www.agazeta.com.br/es/policia/com-quase-30-assaltos-medo-se-instala-em-agencias-dos-correios-no-es-0819"
  );
  const browser = await await puppeteer.launch({
    headless: false,
  });

  try {
    const page = await browser.newPage();
    page.setExtraHTTPHeaders({
      "Accept-Charset": "utf-8",
      "accept-language": "pt-BR",
    });
    console.log(URL_SIMILAR_WEB_SITE + url.hostname);
    await page.goto(URL_SIMILAR_WEB_SITE + url.hostname);

    // await page.waitForSelector(INPUT_SEARCH_SELECTOR);
    // await page.click(INPUT_SEARCH_SELECTOR);
    // await page.keyboard.type(url.hostname);
    // await page.keyboard.press("Enter");

    await page.waitForXPath(
      "/html/body/div[1]/main/div/div/div[2]/div[2]/div/div[3]/div/div/div/div[2]/div/span[2]/span[1]"
    );
    let html = await page.content();
    fs.writeFile("page.html", html, function (err) {
      if (err) throw err;
      console.log("html salvo!");
    });

    console.log(html);
    let resultado = await extraiResultado(page);
    console.log(resultado[0]);
  } catch (err) {
    console.log(err);
  }
  browser.close();
  console.log("Terminou");
}

async function extraiResultado(page) {
  let resultado = await page.evaluate((sel) => {
    return document.getElementsByClassName(sel);
  }, RESULTADO_CLASS);
  return resultado;
}

search();
