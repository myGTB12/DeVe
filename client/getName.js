const Web3 = require('web3')
const web3 = new Web3(
  'https://eth-rinkeby.alchemyapi.io/v2/yeSJBqDewxzDLQTI2f3YURU9KLzbWSbc'
)
const ABI = require('../ABI/USDTABI.json')

const getName = async function (address) {
  const contractAddress = new web3.eth.Contract(ABI, address)
  const getTokenName = await contractAddress.methods.name().call()
  return getTokenName
}

module.exports = getName
