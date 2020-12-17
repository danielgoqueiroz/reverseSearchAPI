const puppeteer = require("puppeteer");
const querystring = require("querystring");

async function run() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: false,
  });
  const page = await browser.newPage();
  page.setExtraHTTPHeaders({
    "Accept-Charset": "utf-8",
    "accept-language": "pt-BR",
  });

  await page.goto(
    "https://ndmais.com.br/politica-sc/eleicoes-municipais/tempo-real-acompanhe-as-eleicoes-em-santa-catarina/"
  );

  await page.waitFor(1000);

  let content = page.evaluate((sel) => {
    let element = document.getElementsByClassName(sel);
    return element ? element : element;
  }, "content-area");

  console.log(content);
}

run();
