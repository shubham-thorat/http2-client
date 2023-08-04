const http2 = require('node:http2');
const fs = require('node:fs');
const logger = require('gk-logger')

const client = http2.connect('https://localhost:8443', {
  ca: fs.readFileSync('localhost-cert.pem')
});
client.on('error', (err) => console.error(err));


const req = client.request({ ':path': '/', ':method': 'GET' });

req.on('response', (headers, flags) => {
  console.log("response received")
  for (const name in headers) {
    console.log(`${name}: ${headers[name]}`);
  }
  console.log("response received after headers printing")
});


req.setEncoding('utf8');
let data = '';

req.on('data', (chunk) => {
  logger.info("data is being received", chunk)
  data += chunk;
});

req.on('end', () => {
  logger.info(`
    All stream received Requst end triggered\n
    Data Received : ${data}`
  );
  client.close();
});

req.end();

