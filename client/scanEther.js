const Web3 = require('web3')
const web3 = new Web3(
  'https://eth-goerli.g.alchemy.com/v2/nnYMEQqYNoP72dLc_iCoGNKUVK5ZTMod'
)
const cron = require('node-cron')
const redis = require('redis')
const client = redis.createClient(6379)
const decimal = 6

async function getBlockNumber() {
  return await web3.eth.getBlockNumber()
}

async function redisBlock() {
  await client.connect()
  const blockNumber = await getBlockNumber()
  return client.get('etherBlock', blockNumber - 5).then(await client.quit())
}
async function scanTransactionsInBlock(blockNumer) {
  const block = await web3.eth.getBlock(blockNumer)
  const transactions = block.transactions
  transactions.forEach(async (transaction) => {
    const tx = await web3.eth.getTransaction(transaction)
    const input = tx.input
    const address_to = '0x' + input.substr(34, 40)
    const amount = '0x' + input.substr(74, 64)
    const amount_to_num = +amount

    const address_from = tx.from
    const token = tx.to
    const data = {
      address_to: address_to,
      address_from: address_from,
      amount: amount_to_num / Math.pow(10, +decimal),
      token: token,
    }
    console.log(data)
    return data
  })
}

async function scan() {
  const blockNumber = await redisBlock()
  for (let i = blockNumber; i < blockNumber + 5; i++) {
    await scanTransactionsInBlock(+blockNumber)
  }
  await client.connect()
  client.set('etherBlock', +blockNumber + 5)
}

cron.schedule('* * * * *', () => {
  console.log(
    '--------------------------------------------------------------------------'
  )
  scan()
})
