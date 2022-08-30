const Web3 = require('web3')
const web3 = new Web3(
  'https://eth-rinkeby.alchemyapi.io/v2/yeSJBqDewxzDLQTI2f3YURU9KLzbWSbc'
)
const axios = require('axios')
const url = 'http://localhost:3000/data'

const db = require('../db.js')
const decimalABI = require('../ABI/decimals.json')
const azero = require('./azerotest')

const USDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926'
const USDTAddress = '0xD92E713d051C37EbB2561803a3b5FBAbc4962431'

async function checkTXEther() {
  checkConnectDB()
  const decimal = await getDecimals(USDTAddress)

  return new Promise((resolve, reject) => {
    db.query(
      'SELECT transaction_code, from_wallet_address, to_wallet_address, send_amount, send_token, id FROM transactions WHERE send_token <> "AZERO" AND status = "PENDING" LIMIT 50',
      async function (err, result) {
        if (err) {
          reject(err)
        }
        tx_code = result.forEach(async (element) => {
          const tx = await getTransaction(element.transaction_code)
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
          if (
            !data.address_to
              .toUpperCase()
              .localeCompare(element.to_wallet_address.toUpperCase()) &&
            !data.address_from
              .toUpperCase()
              .localeCompare(element.from_wallet_address.toUpperCase()) &&
            data.amount == element.send_amount &&
            (data.token.localeCompare(USDCAddress) ||
              data.token.localeCompare(USDTAddress))
          ) {
            try {
              const { data: resData } = await axios({
                method: 'post',
                url: url,
                data: data,
              })
              console.log(resData)
            } catch (err) {
              console.log(err)
            }

            console.log(`${element.id} updated`)
          } else {
            console.log(`${element.id} tạch tạch tạch`)
          }
        })
      }
    )
  })
}

async function checkTxAzero() {
  checkConnectDB()
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT transaction_code, from_wallet_address, to_wallet_address, send_amount, id FROM transactions WHERE send_token = "AZERO" AND status ="PENDING" LIMIT 50',
      async function (err, result) {
        if (err) {
          reject(err)
        }
        checkTx = result.forEach(async (element) => {
          const tx = await azero.checkUserFromBlockHash(
            element.transaction_code
          )

          if (
            !tx.address_from.localeCompare(element.from_wallet_address) &&
            !tx.address_to.localeCompare(element.to_wallet_address) &&
            tx.amount / Math.pow(10, 12) == element.send_amount
          ) {
            try {
              const { data: resData } = await axios({
                method: 'post',
                url: url,
                data: tx,
              })
              console.log(resData)
            } catch (err) {
              console.log(err)
            }
            console.log(`${element.id} updated`)
          } else {
            console.log(`${element.id} tạch tạch tạch`)
          }
        })
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

const getTransaction = async (transaction) => {
  const data = await web3.eth.getTransaction(transaction)
  return data
  //   console.log(data)
}

const getDecimals = async (token) => {
  const contract = new web3.eth.Contract(decimalABI, token)
  const decimal = await contract.methods.decimals().call()
  return decimal
  //   console.log(decimal)
}
module.exports = { checkTXEther, checkTxAzero, getDecimals }
