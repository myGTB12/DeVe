const Web3 = require('web3')
const web3 = new Web3(
  'https://eth-rinkeby.alchemyapi.io/v2/yeSJBqDewxzDLQTI2f3YURU9KLzbWSbc'
)
require('dotenv').config()

const ABI = require('../ABI/USERABI.json')
const userContract = new web3.eth.Contract(
  ABI,
  process.env.USER_CONTRACT_ADDRESS
)

const saveUserInfo = async function (sender, amount, transaction, token) {
  const add = await userContract.methods.addUser(
    sender,
    amount,
    transaction,
    token
  )
  console.log(add)
}

const removeUserInfo = async function (userAddress) {
  await userContract.methods.removeUser(userAddress)
}

const transferOwnership = async function (newOwner) {
  await userContract.methods.transferOwnership(newOwner)
}

const userInfo = async function (userAddress) {
  await userContract.methods.userInfo(userAddress)
}

const showTokensDeposit = async function () {
  await userContract.methods.showTokensDeposit()
}

module.exports = {
  saveUserInfo,
  removeUserInfo,
  transferOwnership,
  userInfo,
  showTokensDeposit,
}
saveUserInfo(
  '0xa94fbe576cb86473397ce25cb988cc8346b1e554',
  1000,
  '0x9d0c0813c991cbe882c212a6977608e4d2c5163a4b35445e36e5278cbb2fb7ca',
  '0x3b00ef435fa4fcff5c209a37d1f3dcff37c705ad'
)
