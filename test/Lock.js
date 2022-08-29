const { ethers } = require('hardhat')
const { expect } = require('chai')
const web3 = require('web3')

describe('User Infor', function () {
  let UserInfo
  let userInfor
  let owner
  let user1
  let user2
  let token

  beforeEach(async function () {
    UserInfo = await ethers.getContractFactory('UserInfos')
    ;[owner, user1, user2, token] = await ethers.getSigners()
    userInfor = await UserInfo.deploy()
    console.log('Deploy succes')
  })

  describe('add User', function () {
    it('User should be added and remove', async function () {
      await userInfor.addUser(
        user1.address,
        1000,
        '0x93e5988a5e8636b6da8398cdcc90a5513b76527e26177acf7eed7600f59617da',
        token.address
      )
      await userInfor.addUser(
        user1.address,
        2000,
        '0x93e5988a5e8636b6da8398cdcc90a5513b76527e26177acf7eed7600f596175a',
        '0x3b00ef435fa4fcff5c209a37d1f3dcff37c705ad'
      )
      let data1 = await userInfor.userInfo(user1.address)
      let sender = data1['sender']
      console.log(data1)

      expect(sender).to.equal(user1.address)

      await userInfor.removeUser(user1.address)
      let data2 = await userInfor.userInfo(user1.address)
      let sender1 = data2['sender']
      expect(sender1).to.equal('0x0000000000000000000000000000000000000000')
    })

    it('Should show tokens user deposit', async function () {
      await userInfor.addUser(
        user1.address,
        1000,
        '0x93e5988a5e8636b6da8398cdcc90a5513b76527e26177acf7eed7600f59617da',
        token.address
      )
      await userInfor.addUser(
        user1.address,
        2000,
        '0x93e5988a5e8636b6da8398cdcc90a5513b76527e26177acf7eed7600f596175a',
        '0x3b00ef435fa4fcff5c209a37d1f3dcff37c705ad'
      )
      const token1 = await userInfor.showTokensDeposit(user1.address)
      console.log(token1)
      expect(token1[0]).to.equal(token.address)
      //expect(token1[1]).to.equal('0x3b00ef435fa4fcff5c209a37d1f3dcff37c705ad')
    })

    it('Should fail when not owner adduser', async function () {
      await userInfor
        .connect(user1)
        .addUser(
          user1.address,
          1000,
          '0x93e5988a5e8636b6da8398cdcc90a5513b76527e26177acf7eed7600f59617da',
          token.address
        )
    })
  })
})
