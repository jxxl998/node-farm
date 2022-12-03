const fs = require('fs');
const http = require('http');
const url = require('url');

///////////
// FILE //
/////////

// blocking, synchronous way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');

// console.log(textIn);
// const textOut = `this is what we know about avocado: ${textIn}.\nCreated on ${Date.now()}`;

// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File written!');

// non-blocking, asynchronous way

// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//   if (err) return console.log('boom!');
//   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     // err always be the 1st one
//     console.log(data2);
//   });
// });

// console.log('will read file!');

/////////////
// SERVER //
///////////

const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');

  return output;
};

// __dirname means the current directory
const templateOverview = fs.readFileSync(
  `${__dirname}/templates/overview.html`,
  'utf-8'
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/product.html`,
  'utf-8'
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/card.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(templateCard, el))
      .join('');

    const output = templateOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);

    // product page
  } else if (pathname === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const product = dataObj[query.id];
    const output = replaceTemplate(templateProduct, product);

    res.end(output);

    // api
  } else if (pathname === '/api') {
    // read json file and return
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);

    // not found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end('<h1>Page not found!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
