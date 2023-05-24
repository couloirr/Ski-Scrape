const scraperObject = {
  url: 'https://www.evo.com/shop/ski/skis/skis_no-bindings',
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    // Navigate to the selected page
    await page.goto(this.url, {
      waitUntil: "domcontentloaded",
    });
    let scrapedData = [];
    // Wait for the required DOM to be rendered

    async function scrapeCurrentPage() {
      // Get the link to all the required books
      let urls = await page.evaluate(() => {
        // Fetch the first element with class "quote"
        // Get the displayed text and returns it
        const quoteList = document.querySelectorAll(".product-thumb-details");
    
        // Convert the quoteList to an iterable array
        // For each quote fetch the text and author
        return Array.from(quoteList).map((quote) => {
          // Fetch the sub-elements from the previously fetched quote element
          // Get the displayed text and return it (`.innerText`)
          const text = quote.querySelector("a").href;
          // const author = quote.querySelector(".author").innerText;
    
          return text;
        });
      });
      urls = urls.slice(0, 5)
      console.log(urls)
      // Loop through each of those links, open a new page instance and get the relevant data from them
      let pagePromise = (link) =>
        new Promise(async (resolve, reject) => {
          let dataObj = {};
          let newPage = await browser.newPage();
          await newPage.goto(link);
          dataObj['productName'] = await newPage.$eval(
            '.pdp-header-title',
            (text) => text.textContent
          );
          dataObj['sku'] = await newPage.$eval(
            '.pdp-header-util-sku',
            (text) => text.textContent
          );

          dataObj['description'] = await newPage.$eval(
            '.pdp-details-content > p',
            (div) => div.textContent
          );
          // dataObj['bookDescription'] = await newPage.$eval(
          //   '#product_description',
          //   (div) => div.nextSibling.nextSibling.textContent
          // );
          // dataObj['upc'] = await newPage.$eval(
          //   '.table.table-striped > tbody > tr > td',
          //   (table) => table.textContent
          // );
          resolve(dataObj);
          await newPage.close();
        });

      for (link in urls) {
        let currentPageData = await pagePromise(urls[link]);
        scrapedData.push(currentPageData);
        // console.log(currentPageData);
      }
      // // When all the data on this page is done, click the next button and start the scraping of the next page
      // // You are going to check if this button exist first, so you know if there really is a next page.
      // let nextButtonExist = false;
      // try {
      //   const nextButton = await page.$eval('.next > a', (a) => a.textContent);
      //   nextButtonExist = true;
      // } catch (err) {
      //   nextButtonExist = false;
      // }
      // if (nextButtonExist) {
      //   await page.click('.next > a');
      //   return scrapeCurrentPage(); // Call this function recursively
      // }
      await page.close();
      return scrapedData;
    }
    let data = await scrapeCurrentPage();
    console.log(data);
    return data;
  },
};

module.exports = scraperObject;
