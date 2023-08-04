const http2 = require('node:http2');
const fs = require('node:fs');
var util = require('util');
const path = require('path')
const logger = require('gk-logger')();

const options = {
  ca: fs.readFileSync('localhost-cert.pem')
}
const client = http2.connect('https://localhost:8443', options);

client.on('error', (err) => logger.error(err));


//15000 : 3247
//12419
const array = new Array(100);
array.fill(0);
array.map((_, index) => {
  const req = client.request({ ':path': '/', ':method': 'POST' });
  // req.on('close', () => {
  //   console.log(`client stream closed for index ${index}`)
  // })
  const sampleData = {
    type: 'post request',
    data: {
      'id': index
    }
  }

  req.setEncoding('utf8');
  req.write(JSON.stringify(sampleData), 'utf-8');
  //send request completed
  req.end();

  logger.info(`Request sent for stream index ${index}`)
  // This callback is fired once we receive a response
  // from the server

  req.on('response', (headers, flags) => {
    logger.info(`Headers ${JSON.stringify(headers)} index: ${index}`)
  });

  let data = '';

  req.on('data', (chunk) => {
    data += chunk;
  });
  req.on('error', (error) => {
    logger.error(`Error stream index ${index} error=${error}`)
  })

  //when all data is fetched
  req.on('end', () => {
    logger.info(`Data Received index : ${JSON.stringify(index)} Data: ${JSON.stringify(data)} `);
  });
  // console.log("request ending", index)

})


// client.close();