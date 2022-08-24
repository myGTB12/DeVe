const Web3 = require('web3')
const web3 = new Web3(
  'https://eth-rinkeby.alchemyapi.io/v2/yeSJBqDewxzDLQTI2f3YURU9KLzbWSbc'
)
const ABI = require('./WETHABI.json')

const WETHAddress = '0xDf032Bc4B9dC2782Bb09352007D4C57B75160B15'
const WETHContract = new web3.eth.Contract(ABI, WETHAddress)

const receiver = '0xd8eabc7167241437EaC79C3437A37dfFa02C9f86'

const sendETH = async function (addressTo, amount) {
  const wallet = web3.eth.accounts.wallet.add(privateKey)
  const sending = await WETHContract.methods
    .transfer(addressTo, amount)
    .send({ from: wallet.address, gas: 100000 })
  console.log(sending)
}
sendETH(receiver, 100)

const sendToken = async function (tokenAddress, amount, addressTo) {
  const tokenContract = new web3.eth.Contract(ABI, tokenAddress)
  //const sending = await tokenContract.methods.transfer(addressTo, amount).send({from: , gas: 100000});
}
