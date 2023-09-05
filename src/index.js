const helper = require('./helper')
const { logger, eventEmitter } = require('./utils')


client.on('error', (err) => {
  logger.error(JSON.stringify({
    "event": "Error event triggered",
    "error": err
  }))
});


client.on('goaway', (errorCode, lastStreamID, opaqueData) => {
  console.log(`Received GOAWAY: ErrorCode ${errorCode}, LastStreamID ${lastStreamID}`);
  logger.error(JSON.stringify({
    'event': "Goaway event triggered",
    'error': `ErrorCode ${errorCode}, LastStreamID ${lastStreamID} opaqueData ${opaqueData}`
  }))

  logger.info(JSON.stringify({
    'event': "Goaway event triggered",
    'error': `ErrorCode ${errorCode}, LastStreamID ${lastStreamID} opaqueData ${opaqueData}`
  }))
  try {
    // client.close()
    // client = Http2.reconnect()
    // eventEmitter.emit('reconnect')

    logger.info("client goaway destroyed", client.closed)
    // client = Http2.reconnect()
    // console.log("CLIENT", client)
  } catch (error) {
    console.log("Error ", error)
  }
  // client.close();
  // client = Http2.reconnect()
  // client.close(() => {
  //   console.log('client closed')
  //   console.log("inside client destroyed", client.destroyed)
  //   client = Http2.reconnect()
  // })
  // logger.info('Trying to reconnect....')
});

client.on('sessionError', (err) => {
  logger.error(JSON.stringify({
    'event': "sessionError event triggered",
    'error': `ErrorCode ${errorCode}, LastStreamID ${lastStreamID} opaqueData ${opaqueData}`
  }))
})
let ct = 0;

const startTime = Date.now();
const sendRequest = (i, max_limit, retry_count = 0) => {
  const startTime = Date.now();
  // logger.info(`Request Count: ${i} retry_count: ${retry_count}`)
  if (client.closed) {
    console.log('session destroyed triggered')
  }
  while (client.closed) {
    console.log(`Session destroyed`, client.destroyed)
    logger.info(`Session destroyed ${i} ${retry_count}`)
  }
  const req = client.request({
    ':path': '/',
    ':method': 'POST'
  });

  const payload = {
    key: 'NODEJS_CLIENT',
    value: 'NODEJS_VALUE'
  }

  req.write(JSON.stringify(payload), 'utf-8');
  req.end();


  req.on('close', (args) => {
    // logger.info(JSON.stringify({
    //   "event": "REQUEST_CLOSE",
    //   "args": args,
    //   "index": i
    // }))
  })


  req.on('error', (err) => {
    // logger.error(JSON.stringify({
    //   "REQUEST RECEIVED ERROR ": err,
    //   "index": i
    // }))
    // console.log("error in request error")
    // exit(1)

    logger.info("Error event received", i)
    if (retry_count <= 5) {
      ct += 1
      retry_count += 1
      // console.log('Inside retry count: ', ct)
      logger.info(`Inside retry mechanism ${ct} ${retry_count}`)
      // setTimeout((count) => {
      // sendRequest(i, max_limit, retry_count)
      // }, retry_count * 5000, retry_count);
    }

  })


  // req.on('response', (headers) => {
  //   logger.info(JSON.stringify({
  //     "Response headers": headers,
  //     "index": i
  //   }))
  // })

  let responseData = ''
  req.setEncoding('utf-8');
  req.on('data', (chunk) => {
    responseData += chunk;
  })

  req.on('end', () => {
    logger.info(JSON.stringify({
      'response_data': responseData,
      'index': i,
      'retry_count': retry_count
    }))

    const endTime = Date.now()
    const data = `${i} ${endTime - startTime}\n`
    const client_log = `./output/logs/client_log_1_${max_limit}.log`
    helper.writeToFile2(data, client_log)
    // logger.info(JSON.stringify({
    //   "Client Data Received": data,
    //   "Client Time Required": `${(endTime - startTime)}ms`
    // }))
  })
}


client.on('connect', stream => {
  console.log("Someone Connected", stream)
  logger.info(JSON.stringify({
    "session": stream
  }))
  let max_limit = 2
  let i = 0;

  const st = Date.now();
  for (let i = 1; i <= max_limit; i++) {
    // setTimeout((index) => {
    // sendRequest(i, max_limit)
    // }, i * 0.5, i);c
    console.log("closed")
  }

  const ed = Date.now();

  // console.log("total time :", ed - st)
  logger.info(JSON.stringify({ "END_TIME": ed - st }))
  client.close()
})



client.on('close', () => {
  logger.info(JSON.stringify({ msg: "Closing tcp connection", timeRequired: (Date.now() - startTime) / 1000 }))
  console.log("All request send closing tcp connection clientDestroyed : ", client)
  client = Http2.reconnect()
  // console.log(first)
})