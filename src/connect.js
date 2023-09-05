const http2 = require('node:http2');
const path = require('node:path');
const { logger, eventEmitter } = require('./utils')
const fs = require('node:fs');
require('dotenv').config()

// let client = null

// const createConnection = () => {
//   const is_prod = process.env.IS_PROD === 'true' ? true : false
//   const base_url = is_prod ? process.env.BASE_URL : 'https://localhost:6000'
//   const certificate_path = '../ssl2/prod-cert.pem'
//   console.log(`Trying to connect to ALB: ${base_url}`)
//   logger.info(`Trying to connect to ALB: ${base_url}`)

//   let instance = http2.connect(base_url, {
//     ca: fs.readFileSync(path.join(__dirname, certificate_path)),
//     rejectUnauthorized: false,
//     maxSessionMemory: 10000,
//     settings: {
//       maxConcurrentStreams: 100000,
//     }
//   }).on('connect', (stream) => {
//     console.log('HTTP/2 connected')
//     logger.info(JSON.stringify({
//       'message': 'HTTP/2 connected',
//       'stream': stream
//     }))
//   });

//   return instance
// }

class Http2 {
  static instance = null
  static getClient() {

    if (!this.instance || this.instance.closed || this.instance.destroyed) {
      console.log('Get Client creating new client for HTTP/2')

      const is_prod = process.env.IS_PROD === 'true' ? true : false
      const base_url = is_prod ? process.env.BASE_URL : 'https://localhost:6000'
      const certificate_path = '../ssl2/prod-cert.pem'
      console.log(`Trying to connect to ALB: ${base_url}`)
      logger.info(`Trying to connect to ALB: ${base_url}`)

      this.instance = http2.connect(base_url, {
        ca: fs.readFileSync(path.join(__dirname, certificate_path)),
        rejectUnauthorized: false,
        maxSessionMemory: 10000,
        settings: {
          maxConcurrentStreams: 100000,
        }
      }).on('connect', (stream) => {
        console.log('HTTP/2 connected ', stream)
        logger.info(JSON.stringify({
          'message': 'HTTP/2 connected',
          'stream': stream
        }))
      });
    }

    return this.instance
  }

  static setNull() {
    console.log('Setting instance null')
    this.instance = null
  }
}


//connecting to server
let client = Http2.getClient()

client.on('error', (err) => {
  logger.error(`connection error: ${err}`);
  setTimeout(createConnection, 1000);
});


client.on('goaway', (errorCode, lastStreamID, opaqueData) => {
  logger.info(JSON.stringify({
    'message': 'goaway event received',
    'errorcode': errorCode,
    'lastStreamID': lastStreamID,
    'opaqueData': opaqueData
  }))

  client.close()
  console.log('goaway event received')
  logger.info(JSON.stringify(`closed tcp connection && emit reconnect event client_state: ${client}`))
})

client.on('close', () => {
  logger.info('connection closed');
  console.log('connection closed')
  // setTimeout(createConnection, 1000);
})


eventEmitter.on('reconnect', () => {
  console.log('reconnect emitter is called')
  setTimeout(createConnection, 1000);
  // client = createConnection()
})


module.exports = {
  client,
  Http2
}

