

const sleepHold = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

const sleep = async () => {
  await sleepHold(1000);
}

module.exports = sleep