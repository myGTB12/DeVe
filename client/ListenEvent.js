const Web3 = require('web3')
const ABI = require('../ABI/USDTABI.json')
const USDCABI = require('../ABI/USDCABI.json')
const balanceABI = require('../ABI/balance.json')
const decimalABI = require('../ABI/decimals.json')

const web3 = new Web3(
  'https://eth-rinkeby.alchemyapi.io/v2/yeSJBqDewxzDLQTI2f3YURU9KLzbWSbc'
)
const redis = require('redis')

const USDTAddress = '0xD92E713d051C37EbB2561803a3b5FBAbc4962431' //USDT Testnet address
const USDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926' //USDC Testnet address
const USDTContract = new web3.eth.Contract(ABI, USDTAddress)
const USDCContract = new web3.eth.Contract(USDCABI, USDCAddress)

const redisClient = redis.createClient(6379)

const getBalance = async (token, address) => {
  const contract = new web3.eth.Contract(balanceABI, token)

  const balance = await contract.methods.balanceOf(address).call()
  console.log(balance)
}

const getDecimals = async (token) => {
  const contract = new web3.eth.Contract(decimalABI, token)
  const decimal = await contract.methods.decimals().call()
  console.log(decimal)
}

const listenEventUSDT = async (address, block) => {
  const tx = await USDTContract.getPastEvents('Transfer', {
    filter: {
      to: address,
    },
    fromBlock: block,
    toBlock: 'latest',
  })
  console.log('...............................')
  return tx
}

const listenEventUSDC = async (address, block) => {
  const tx = await USDCContract.getPastEvents('Transfer', {
    filter: {
      to: address,
    },
    fromBlock: block,
    toBlock: 'latest',
  })
  return tx
}

const redisCheckBlock = async function () {
  await redisClient.connect()
  return redisClient.get('fromBlock', 0).then(await redisClient.quit())
}

module.exports = {
  listenEventUSDT: listenEventUSDT,
  redisCheckBlock: redisCheckBlock,
  listenEventUSDC: listenEventUSDC,
}
// getDecimals(USDTAddress)
