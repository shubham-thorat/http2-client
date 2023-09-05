const async = require('async')
const { Http2 } = require('./connect')
const { logger } = require('./utils')
const statsdclient = require('./statsD')

let client = Http2.getClient()


const queue = async.queue((task, completed) => {

  if (client.closed) {
    console.log('client is closed ', client.closed)
    client = Http2.getClient()
  }
  // console.log('started processing ', JSON.stringify(task))
  logger.info(JSON.stringify({
    "task": task,
  }))
  const remaining = queue.length()
  sendRequest(task.requestCount, task.retry_count + 1)
  completed(null, {
    'requestCount': task.requestCount,
    'retry_count': task.retry_count + 1,
    'remaining': remaining
  })
}, 1)



const sendRequest = (requestCount, retry_count = 0) => {
  const startTime = Date.now()


  statsdclient.timing('request_send', 1)
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


    queue.push({ requestCount, retry_count }, (err, { requestCount, retry_count, remaining }) => {
      if (err) {
        console.log(`there is an error  in the task ${requestCount} ${retry_count}`);
      } else {
        // console.log(`queue has execute the task ${requestCount} ${retry_count}.. ${remaining} tasks remaining`);
      }
    })
  })

  let responseData = ''
  req.on('data', (chunk) => {
    responseData += chunk
  })

  req.on('end', () => {
    const endTime = Date.now()
    statsdclient.timing('response_received', 1)
    statsdclient.timing('client_response_time', endTime - startTime)
    logger.info(JSON.stringify({
      'message': 'response data received',
      'data': responseData,
      'requestCount': requestCount
    }))
  });

  req.end();
}

const main = () => {
  const total_request = process.env.TOTAL || 10000

  console.log(JSON.stringify({
    "total_request": parseInt(total_request)
  }))

  for (let i = 0; i < total_request; i++) {
    sendRequest(i)
  }
}

main()