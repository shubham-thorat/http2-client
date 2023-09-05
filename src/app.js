const { client, setNewConnection } = require('./connect')
const { logger, eventEmitter } = require('./utils')

const sendRequest = (requestCount, retry_count = 0) => {

  // if (client.destroyed || client.closed) {
  //   console.log('In loop', client.destroyed, " ", client.closed, " requestcount", requestCount)
  //   setNewConnection()
  // }


  const req = client.request({ ':path': '/', ':method': 'POST' });
  const payload = {
    key: 'HTTP2_KEY',
    value: 'HTTP2_VALUE'
  }
  req.write(JSON.stringify(payload), 'utf-8');
  logger.info(`request_count: ${requestCount} retry_count: ${retry_count}`)
  req.on('error', (err) => {
    // console.log('request error: ', requestCount)
    logger.error(JSON.stringify({
      'message': 'error event received',
      'error': err,
      'requestCount': requestCount
    }))

    if (retry_count <= 3) {
      sendRequest(requestCount, retry_count + 1)
    }
  })

  let responseData = ''
  req.on('data', (chunk) => {
    responseData += chunk
  })

  req.on('end', () => {
    logger.info(JSON.stringify({
      'message': 'response data received',
      'data': responseData,
      'requestCount': requestCount
    }))
  });

  req.end();
}

const main = () => {
  for (let i = 0; i < 23000; i++) {
    sendRequest(i)
  }
}

main()