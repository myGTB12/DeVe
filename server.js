const express = require('express')
const app = express()

const bodyParse = require('body-parser')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const axios = require('axios')

const listenModule = require('./client/ListenEvent.js')
const checkTX = require('./client/checkTX.js')
const sendERC20 = require('./client/sendERC20.js')
const listenAzero = require('./client/azerotest.js')
const transferABI = require('./ABI/transferERC20ABI.json')

const Web3 = require('web3')
const web3 = new Web3(
  'https://eth-rinkeby.alchemyapi.io/v2/yeSJBqDewxzDLQTI2f3YURU9KLzbWSbc'
)
require('dotenv').config()

const redis = require('redis')
const redisClient = redis.createClient(6379)
const db = require('./db')
const getName = require('./client/getName.js')
const { text } = require('body-parser')
const sendERC20Token = require('./client/sendERC20.js')

const USDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926'
const USDTAddress = '0xD92E713d051C37EbB2561803a3b5FBAbc4962431'

app.post('/tokenName', async (req, res) => {
  const tokenName = await getName(req.body.tokenAddress)
  res.send(tokenName)
})

app.post('/sendProjectToken', async (req, res) => {
  const token = req.body.token
  const receiver = req.body.receiver
  const decimal = checkTX.getDecimals(token)
  const amount = +req.body.amount * Math.pow(10, 6)

  checkConnectDB()
  return new Promise((result, reject) => {
    db.query(
      'SELECT value FROM mydb.settings where key_column = "PRIVATE_KEY"',
      async function (err, result, fields) {
        if (err) {
          reject(err)
        }
        const private_key = result[0].value
        const wallet = web3.eth.accounts.wallet.add(private_key)
        const sendToken = async function () {
          const tokenContract = new web3.eth.Contract(transferABI, token)
          const gasprice = await web3.eth.getGasPrice()
          const transfer = tokenContract.methods.transfer(receiver, +amount)
          const gasEstimate = await transfer.estimateGas({
            from: wallet.address,
          })
          const tx = await transfer.send({
            from: wallet.address,
            gas: web3.utils.toHex(gasEstimate),
            gasPrice: web3.utils.toHex(gasprice),
          })
          res.send(tx)
        }
        sendToken()
      }
    )
  })
})

//scan transaction đc tạo có hợp lệ ko
app.post('/checkAndScanTxAzero', async (req, res) => {
  checkTX.checkTxAzero()
  res.send('Azero')
})

app.post('/data', async (req, res) => {
  console.log('ádasdasdas')
  res.send('success')
})

app.post('/checkAndScanEther', async (req, res) => {
  checkTX.checkTXEther()
  res.send('Ether')
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
