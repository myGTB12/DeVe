const Web3 = require('web3')
const web3 = new Web3(
  'https://eth-rinkeby.alchemyapi.io/v2/yeSJBqDewxzDLQTI2f3YURU9KLzbWSbc'
)
const ABI = require('../ABI/transferERC20ABI.json')
const config = require('dotenv').config()

const wallet = web3.eth.accounts.wallet.add(process.env.KEY)

const sendERC20Token = async function (tokenAddress, receiver, amount) {
  const tokenContract = new web3.eth.Contract(ABI, tokenAddress)
  var gasprice = await web3.eth.getGasPrice()
  var transfer = tokenContract.methods.transfer(receiver, amount)
  var gasEstimate = await transfer.estimateGas({ from: wallet.address })
  const tx = await transfer.send({
    from: wallet.address,
    gas: web3.utils.toHex(gasEstimate),
    gasPrice: web3.utils.toHex(gasprice),
  })
  console.log(tx)
}

// web3.eth.getBlock('latest', false, (error, result) => {
//   console.log(result.gasLimit)
// })

// sendERC20Token(
//   '0xd92e713d051c37ebb2561803a3b5fbabc4962431',
//   '0xd8eabc7167241437eac79c3437a37dffa02c9f86',
//   1234567
// )

module.exports = sendERC20Token
