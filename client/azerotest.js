const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api')
const config = require('dotenv').config()

const PHRASE = process.env.PHASE_AZERO

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

  //const myAccount = keyring.addFromUri(PHRASE)

  let {
    data: { free: previousFree },
    nonce: previousNonce,
  } = await api.query.system.account(addr)
  console.log(
    `Your account has a balance of ${previousFree}, nonce ${previousNonce}`
  )
  api.query.system.account(
    addr,
    ({ data: { free: currentFree }, nonce: currentNonce }) => {
      const change = currentFree.sub(previousFree)
      if (!change.isZero()) {
        console.log(`New balance change of ${change}, nonce ${currentNonce}`)
        previousFree = currentFree
        previousNonce = currentNonce
      }
    }
  )
}

//gửi tiền và lấy về blockHash
async function getBlockHash() {
  const provider = new WsProvider('wss://ws.test.azero.dev')
  const api = await ApiPromise.create({ provider })
  const myAccount = keyring.addFromUri(process.env.PHASE_AZERO)
  const unsub = await api.tx.balances
    .transfer(addr, 12345)
    .signAndSend(myAccount, (result) => {
      console.log(123)
      console.log(result.toHuman())
    })
  // console.log(unsub)
}

//lấy thông tin tx qua block hash
//parameter String
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
        res(data)
      }
    })
  })
}
module.exports = { checkUserFromBlockHash }
// async function test() {
//   const abc = await checkUserFromBlockHash(
//     '0xf977cab61efabfa0de102afaa6f685190a3b90b1836f01cfa089f642c52a48ea'
//   )
//   console.log('hehe', abc)
// }
// test()
// getBlockHash()
