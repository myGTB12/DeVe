const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api')

const addr = '5CahCCFB3SShAkfUntPzR2poYp7D8NeK42xKbcusfSXngXE5' //Duc

const keyring = new Keyring({ type: 'sr25519' })

const provider = new WsProvider('wss://ws.test.azero.dev')

// const api = await ApiPromise.create({ provider })

async function listenAzero() {
  const api = await ApiPromise.create({ provider })
  return new Promise((resolve, reject) => {
    api.query.system.events((events) => {
      console.log(events.toString())
      let s = events
        .filter(({ event }) => {
          return (
            `${event.section}` == 'balances' &&
            `${event.method}` == 'Transfer' &&
            `${event.data[1]}` == addr
          )
        })
        .map((item) => item.event.data.toString())
      console.log(s)
      resolve(s)
    })
  })
}
module.exports = { listenAzero }
async function balanceChange() {
  const provider = new WsProvider('wss://ws.test.azero.dev')
  const api = await ApiPromise.create({ provider })

  const myAccount = keyring.addFromUri(PHRASE)

  let {
    data: { free: previousFree },
    nonce: previousNonce,
  } = await api.query.system.account(addr)
  console.log(
    `Your account has a balance of ${previousFree}, nonce ${previousNonce}`
  )
}

//gửi tiền và lấy về blockHash
async function getBlockHash() {
  const provider = new WsProvider('wss://ws.test.azero.dev')
  const api = await ApiPromise.create({ provider })
  const myAccount = keyring.addFromUri(PHRASE)
  const unsub = await api.tx.balances
    .transfer(addr, 12345)
    .signAndSend(myAccount, (result) => {
      console.log(result.toHuman())
    })
}

//lấy thông tin tx qua block hash
//parameter String
async function checkUserFromBlockHash(blockHash) {
  const api = await ApiPromise.create({ provider })
  const signedBlock = await api.rpc.chain.getBlock(blockHash)
  const apiAt = await api.at(signedBlock.block.header.hash)

  return new Promise(async function (resolve, reject) {
    await apiAt.query.system.events((events) => {
      resolve(events[2].event.data.toString())
    })
  })
}
module.exports = { checkUserFromBlockHash }
// balanceChange()
