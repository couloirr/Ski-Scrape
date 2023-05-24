// const browserObject = require('./browser');
// const scraperController = require('./pageController');

// //Start the browser and create a browser instance
// let browserInstance = browserObject.startBrowser();

// // Pass the browser instance to the scraper controller
// scraperController(browserInstance);
const fs = require('fs');
const { parse } = require('path');
let data = fs.readFileSync('./Raw Ski Data/BDSkis.json');
data = JSON.parse(data);
// console.log(data.Results);
const resultArr = [];

data.Results.forEach((element) => {
  const parsedData = {};
  const current = element.Document;
  parsedData.id = element.DocId;
  parsedData.price = current.price_usd[0];
  parsedData.name = current.name_child[0];
  parsedData.img = current.image[0];
  parsedData.description = current.description_long_en[0];
  parsedData.size = processSize(current.size);

  parsedData.link = current.url_detail[0];
  parsedData.type = current.activity;
  parsedData.radius = current.turn_radius;
  parsedData.dimensions = current.dimensions;
  parsedData.weight = current.weight;
  console.log(current.activity);
  resultArr.push(parsedData);
  //   console.log(typeof current.price_usd);
});
console.log(resultArr);

function processSize(arr) {
  const result = [];
  arr.forEach((element) => {
    element = element.replace(/\D+/g, '');

    result.push(Number(element));
    console.log(result);
  });
  return result;
}
