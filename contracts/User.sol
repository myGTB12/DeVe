// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract UserInfos is Ownable {
    struct UserInfo {
        address sender;
        uint256 amount;
        address[] token;
    }

    mapping(address => UserInfo) public userInfo;
    event AddUser(address _sender, uint256 _amount, address _token);
    event UserRedeposit(uint256 _amount, address _token);
    event RemoveUser(address _userAddress);

    function addUser(
        address _sender,
        uint256 _amount,
        address _token
    ) public onlyOwner returns (bool) {
        UserInfo storage user = userInfo[_sender];
        if (user.sender == address(0)) {
            user.sender = _sender;
            user.amount = _amount;
            user.token.push(_token);

            emit AddUser(_sender, _amount, _token);
            return true;
        } else {
            user.amount += _amount;
            user.token.push(_token);

            emit UserRedeposit(_amount, _token);
            return false;
        }
    }

    function removeUser(address _userAddress) public onlyOwner {
        delete userInfo[_userAddress];

        emit RemoveUser(_userAddress);
    }

    function showTokensDeposit(address _user)
        public
        view
        returns (address[] memory)
    {
        UserInfo storage user = userInfo[_user];
        return user.token;
    }
}
