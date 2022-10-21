const cron = require('node-cron')
const redis = require('redis')
const client = redis.createClient(6379)

const { ApiPromise, WsProvider } = require('@polkadot/api')
const provider = new WsProvider('wss://ws.test.azero.dev')

async function formatCurrentBlock() {
  const api = await ApiPromise.create({ provider })
  const blockNumber = await api.rpc.chain.getBlock()
  return +blockNumber.block.header.number.toString()
}

async function redisBlock() {
  await client.connect()
  const blockNumber = await formatCurrentBlock()
  return client.get('azeroBlock', blockNumber - 60).then(await client.quit())
}
async function checkUserFromBlockHash(blockHash) {
  const api = await ApiPromise.create({ provider })
  const signedBlock = await api.rpc.chain.getBlock(blockHash)
  return new Promise((res, rej) => {
    signedBlock.block.extrinsics.forEach((ex) => {
      const {
        isSigned,
        meta,
        method: { args, method, section },
      } = ex

      if (ex.isSigned) {
        const data = {
          address_from: ex.signer.toString(),
          address_to: ex.method.args[0].toString(),
          amount: +ex.method.args[1],
        }
        console.log(data)
        res(data)
      }
    })
  })
}

async function getblockI() {
  const api = await ApiPromise.create({ provider })
  const blockNumber = await redisBlock()
  console.log(12)
  for (let i = blockNumber; i < blockNumber + 60; i++) {
    const blockHash = await api.rpc.chain.getBlockHash(blockNumber + Number(i))
    checkUserFromBlockHash(blockHash)
  }
  console.log(34)
  await client.connect()
  client.set('azeroBlock', blockNumber + 60)
}

cron.schedule('* * * * *', () => {
  console.log(
    '--------------------------------------------------------------------------'
  )
  getblockI()
})
