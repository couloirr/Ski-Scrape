const scraperObject = {
  url: 'https://www.evo.com/shop/ski/skis/skis_no-bindings/rpp_400',
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
          // dataObj['price'] = await newPage.$eval(
          //   '.pdp-price-regular',
          //   (div) => divdiv.textContent
          // );
          dataObj['price'] = await newPage.evaluate(() => {
            let el = document.querySelector(".pdp-price-regular")
            return el ? el.textContent : document.querySelector('.pdp-price-message-group').textContent
          })
          dataObj['features'] = await newPage.evaluate(
            () => {
              const features = document.querySelectorAll('.pdp-feature')
              return Array.from(features).map((feature) => {
                // Fetch the sub-elements from the previously fetched quote element
                // Get the displayed text and return it (`.innerText`)
                const title = feature.querySelector("h5").textContent;
                const description = feature.querySelector(".pdp-feature-description").textContent;
                console.log(title, description)
                return {[title]: description};
              })
            }
          );
          dataObj['specs'] = await newPage.evaluate(
            
            () => {
              const items = document.querySelectorAll('#pdp-specs > .js-mobile-accordion-content > div > ul > li')
              return Array.from(items).map((item) => {
                const specType = item.querySelector(".pdp-spec-list-title").textContent
                const description = item.querySelector(".pdp-spec-list-description").textContent
                return {[specType]: description}
              })
            }
          );
          dataObj['size'] = await newPage.$eval(
            '.spec-table > thead > tr',
            (div) => {
              const items = div.querySelectorAll('td')
              return Array.from(items).map(item => item.textContent)
             
             
            }
          );
          dataObj['tableBody'] = await newPage.$eval(
            '.spec-table > tbody',
            (div) => {
              const trs =  Array.from(div.querySelectorAll('tr'))
              return trs.map(tr => {
                const title = tr.querySelector('th').textContent
                const tds = tr.querySelectorAll('td')
                const arr = Array.from(tds).map(item => item.textContent)

                return {[title]: arr}
              });     
            }
          );
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
