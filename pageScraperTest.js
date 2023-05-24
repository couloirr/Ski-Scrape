const puppeteer = require('puppeteer');


const getQuotes = async () => {
    // Start a Puppeteer session with:
    // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
    // - no default viewport (`defaultViewport: null` - website page will be in full width and height)
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
  
    // Open a new page
    const page = await browser.newPage();
  
    // On this new page:
    // - open the "http://quotes.toscrape.com/" website
    // - wait until the dom content is loaded (HTML is ready)
    // await page.goto("http://quotes.toscrape.com/", {
    //   waitUntil: "domcontentloaded",
    // });
    await page.goto("https://www.evo.com/shop/ski/skis/skis_no-bindings", {
      waitUntil: "domcontentloaded",
    });
  
    // Get page data
    const quotes = await page.evaluate(() => {
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
  
    // Display the quotes
    console.log(quotes);
  
    // Close the browser
    await browser.close();
  };
  
  // Start the scraping
  getQuotes();