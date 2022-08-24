const express = require('express')
const app = express()

const bodyParse = require('body-parser')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const axios = require('axios')

const listenModule = require('./client/ListenEvent.js')

const sendERC20 = require('./client/sendERC20.js')
const listenAzero = require('./client/azerotest.js')

const Web3 = require('web3')
const web3 = new Web3(
  'https://eth-rinkeby.alchemyapi.io/v2/yeSJBqDewxzDLQTI2f3YURU9KLzbWSbc'
)
require('dotenv').config()

const ABI = require('./ABI/USERABI.json')
const userContract = new web3.eth.Contract(
  ABI,
  process.env.USER_CONTRACT_ADDRESS
)

const redis = require('redis')
const redisClient = redis.createClient(6379)

const db = require('./db')
const getName = require('./client/getName.js')

const wallet = web3.eth.accounts.wallet.add(process.env.KEY)

app.get('/scanUSDT', async (req, res) => {
  //checked
  await checkConnectDB()
  const data = await checkSending()
  res.send(data)
})

app.post('/saveUserInfo', async (req, res) => {
  //checked
  const sender = req.body.sender
  const amount = req.body.amount
  const transaction = req.body.transaction
  const token = req.body.token

  const bol = await userContract.methods
    .addUser(sender, amount, transaction, token)
    .send({ from: wallet.address, gas: 1000000 })
  res.send(JSON.stringify(bol))
})

app.post('/removeUserInfo', async (req, res) => {
  //checked
  const sender = req.body.sender
  await userContract.methods
    .removeUser(sender)
    .send({ from: wallet.address, gas: 1000000 })
  res.send('User removed!')
})

app.post('/tokenName', async (req, res) => {
  const tokenName = await getName(req.body.tokenAddress)
  res.send(tokenName)
})

app.post('/sendProjectToken', async (req, res) => {
  const token = req.body.token
  const amount = req.body.amount
  const receiver = req.body.receiver
  await sendERC20(token, receiver, amount).send({
    from: wallet.address,
    gas: 1000000,
  })
  res.send('success')
})

app.post('/transferOwner', async (req, res) => {
  const newOwner = req.body.newOwner
  await userContract.methods
    .transferOwnership(newOwner)
    .send({ from: wallet.address, gas: 1000000 })
  res.send('done')
})

app.post('/userInfo', async (req, res) => {
  const userAddress = req.body.userAddress
  const user = await userContract.methods
    .userInfo(userAddress)
    .send({ from: wallet.address, gas: 1000000 })

  res.json(user)
})

app.get('/showTokensDeposit', async (req, res) => {
  const userAddress = req.body.userAddress
  const tokens = await userContract.methods
    .showTokensDeposit(userAddress)
    .send({ from: wallet.address, gas: 1000000 })
  res.send(tokens)
})

//bắt sự kiện chuyển tiền đến địa chỉ ví trong db
app.get('/listenAzero', async (req, res) => {
  const events = listenAzero.listenAzero()
  res.send(events)
})

//scan transaction đc tạo có hợp lệ ko
app.post('/checkAndScanTxAzero', async (req, res) => {
  await checkConnectDB()
  const data = await checkAzero()

  res.send(data)
})

async function checkAzero() {
  let tx
  return new Promise(function (resolve, reject) {
    db.query(
      'SELECT blockHash FROM blockhash',
      async function (err, result, fields) {
        if (err) {
          reject(err)
        }

        tx = result.map((item) => item.blockHash)
        console.log(tx[0])
        var txScan = await listenAzero.checkUserFromBlockHash(tx[0])
        console.log(txScan)
        resolve(txScan)
      }
    )
  })
}

async function checkConnectDB() {
  return new Promise(function (resolve, reject) {
    db.getConnection(function (err, connection) {
      if (err) {
        return reject(err)
      }
      return resolve(0)
    })
  })
}

async function checkSending() {
  const block = await listenModule.redisCheckBlock()
  let address
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT address FROM customers',
      async function (err, result, fields) {
        if (err) {
          reject(err)
        }
        address = result.map((item) => item.address)
        await redisClient.connect()

        const tx = await listenModule.listenEventUSDT(address, block)
        // console.log(tx)
        await redisClient.set('fromBlock', tx[tx.length - 1].blockNumber)
        await redisClient.quit()
        resolve(tx)
      }
    )
  })
}

app.listen(3000)
