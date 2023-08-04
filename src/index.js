const http2 = require('node:http2');
const fs = require('node:fs');
const logger = require('gk-logger')()
const sleep = require('sleep');

const client = http2.connect('https://localhost:5000', {
  ca: fs.readFileSync('localhost-cert.pem')
});

client.on('error', (err) => console.error("client", err));

const getTime = (startTime) => {
  return (Date.now() - startTime) / 1000;
}

console.log("sleeping before")
// Time.sleep(10000)
console.log("sleeping after")
const sendRequest = (i) => {
  const startTime = Date.now();
  logger.info(`Request is being send ${i}....`)


  const req = client.request({
    ':path': '/',
    ':method': 'POST',
    'rid': i
  });

  const payload = {
    type: 'POST Request',
    rid: i
  }
  req.write(JSON.stringify(payload), 'utf-8')
  req.end();

  req.on('error', (err) => {
    logger.error(JSON.stringify({
      "Error": err,
      "index": i
    }))
  })

  req.on('response', (headers) => {
    logger.info(JSON.stringify({
      "Response headers": headers,
      "index": i
    }))
    // req.end()
  })

  let data = ''
  req.setEncoding('utf-8');
  req.on('data', (chunk) => {
    data += chunk;
  })

  req.on('end', () => {
    const timeRequired = getTime(startTime)
    logger.info(JSON.stringify({
      "Client Data Received": data,
      "Client Time Required": timeRequired
    }))
  })

  logger.info(`Reach at the end of request`)
  // sleep.sleep(1)
}

client.on('connect', stream => {
  console.log("Someone Connected", stream)
  let i = 0;

  // sleep.sleep(5);
  for (i = 0; i < 32000; i++) {
    setTimeout((index) => {
      sendRequest(index)
    }, i * 0.05, i);
  }

})


client.on('close', () => {
  console.log("All request send closing tcp connection")
})