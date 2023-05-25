const scraperObject = {
    url: 'https://www.runningwarehouse.com/Mens_Neutral_Road_Running_Shoes/catpage-MNROAD.html',
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
          const links = document.querySelectorAll(".is-shoe");
      
          // Convert the quoteList to an iterable array
          // For each quote fetch the text and author
          return Array.from(links).map((el) => {
            // Fetch the sub-elements from the previously fetched quote element
            // Get the displayed text and return it (`.innerText`)
            const text = el.href;
           
            // const author = quote.querySelector(".author").innerText;
      
            return text;
          });
        });
        urls = urls.slice(1,51)
        console.log(urls)
        // Loop through each of those links, open a new page instance and get the relevant data from them
        let pagePromise = (link) =>
          new Promise(async (resolve, reject) => {
            let dataObj = {};
            let newPage = await browser.newPage();
            await newPage.goto(link);
            
            dataObj['productName'] = await newPage.$eval(
              '.h2',
              (text) => text.textContent
            );
            dataObj['price'] = await newPage.evaluate(() => {
                const sale = document.querySelector('.is-crossout')
                if(sale) return sale.textContent
                else return document.querySelector('.afterpay-full_price').textContent
            }
            //   '.afterpay-full_price',
            //   (text) => text.textContent
            );
  
            dataObj['image'] = await newPage.$eval(
              '.main_image',
              (div) => div.src
            );
            dataObj['modelNum'] = await newPage.$eval(
                '.mb-3',
                (div) => div.textContent.replace(/Model Number: /g, "")
              );
            dataObj['description'] = await newPage.$eval(
              '#stabilityModal',
              (div) => div.nextElementSibling.nextElementSibling.nextElementSibling.textContent
            );
            dataObj['features'] = await newPage.$eval(
                ".mb-3",
                (div) => {
                    if(!div.previousElementSibling) return []
                    const lis = div.previousElementSibling.querySelectorAll('li')
                    if(lis.length > 0) return Array.from(lis).map(li => li.textContent)
                    else return []
                    
                }
              );
              dataObj['specs'] = await newPage.evaluate(
                // "#product_sizing > .fixed-width > .fit_table",
                (div) => {
                    const table = document.querySelector('.fit_table > tbody')
                    let trs = []
                    if(!table) return []
                    else trs = table.querySelectorAll('tr')
                    if(trs.length === 0) return []
                    const trArr = Array.from(trs)
                   return trArr.map(tr => {
                        const spec = tr.firstChild.textContent
                        let num = tr.firstChild.nextElementSibling.textContent.replace(/mm/g, "")
                        const idx = num.search(/oz/i)
                        if (idx !== -1) num = num.slice(0, idx + 2)
                        return {[spec]: num}
                    })
                   
                }
              );
              dataObj['technologies'] = await newPage.$eval(
                "#product_tech > .fixed-width",
                (div) => {
                    const ps = div.querySelectorAll('p')
                    if(ps.length === 0) return [];
                    const pArr = Array.from(ps)
                   return pArr.map(p => {
                        const cat = p.textContent
                        if(!p.nextElementSibling) return []
                        const lis = p.nextElementSibling.querySelectorAll('li')
                        if(lis.length === 0) return []
                       const lisArr =  Array.from(lis).map(li => li.textContent)
                       return {[cat]: lisArr}
                    })
                   
                }
              );
              dataObj['fit'] = await newPage.$eval(
                "#product_sizing > .fixed-width",
                (div) => {
                    if (div.querySelectorAll('h3').length > 1) {
                        let tables =  div.querySelectorAll('table')
                        if(tables.length === 0) return []
                        tables = Array.from(tables)
                        const table = tables[tables.length - 1]
                        if(!table.firstChild) return []
                        const trs = table.firstChild.querySelectorAll('tr')
                        if(trs.length === 0) return []
                        const trArr = Array.from(trs)
                       return trArr.map(tr => {
                            const spec = tr.firstChild.textContent.replace(/[:\-" ]/g, "")
                            const num = tr.firstChild.nextElementSibling.textContent
        
                            return {[spec]: num}
                        })


                    }else return []
         
                   
                }
              );
            dataObj['overview'] = await newPage.evaluate(
              () => {
                const features = document.querySelectorAll('.header_bestuse')
                if(features.length === 0) return []
                return Array.from(features).map((feature) => {
               const title =  feature.firstChild.textContent
               let description = ''
               if (title === 'Best use' || title === 'Surface') description = feature.nextElementSibling.querySelector('.row').firstChild.textContent
               else description = feature.nextElementSibling.querySelector('.is-active').textContent
                  return {[title]: description};
                })
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
  