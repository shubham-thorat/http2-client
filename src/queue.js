const async = require('async');
const { logger } = require('./utils')

const queue = async.queue((task, completed) => {
  logger.info(JSON.stringify(`Currently Busy Processing Task ${JSON.stringify(task)}`));
  execute(task.requestCount - 300, task.retry_count + 1)
  const remaining_task = queue.length();
  completed(null, { task, remaining_task });
}, 1)


const execute = (requestCount, retry_count = 0) => {

  if (requestCount <= 300) {
    logger.info(JSON.stringify(`executed  request_count: ${requestCount} retry_count${retry_count}`))
  } else {
    logger.info('error pushing to queue')
    queue.push({ requestCount, retry_count }, (err, { task, remaining_task }) => {
      if (err) {
        logger.info(JSON.stringify(`there is an error  in the task ${JSON.stringify(task)} ${remaining_task}`));
      } else {
        logger.info(JSON.stringify(`queue has execute the task ${JSON.stringify(task)} ${remaining_task} tasks remaining`));
      }
    })
  }
}


const main = () => {
  for (let i = 0; i < 750; i++) {
    execute(i)
  }
}

main()