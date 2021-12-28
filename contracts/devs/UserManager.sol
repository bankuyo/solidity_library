// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

contract UserManager {
    struct User {
        uint numBorrowing;
        uint[] tokenIds;
    }

    mapping(address => bool) public isAlreadyPurchased;
    address[] public purchaserAddresses;
    mapping(address => User) public users;


    modifier restrictedBorrow(address _user, uint _maxBorrowing){
        User memory user = users[_user];
        require(_maxBorrowing >user.numBorrowing);
        _;
    }
    
    function getBorrowingNum(address _user) external view returns(uint){
        User memory user = users[_user];
        return user.numBorrowing;
    }

    function getUserData(address _user) external view returns(User memory) {
        User memory user = users[_user];
        return user;
    }

    function getPurchasersAddress() external view returns(address[] memory){
        return purchaserAddresses;
    }

    function _userPurchase(address _user, uint _tokenId) internal {
        if(!isAlreadyPurchased[_user]){
            purchaserAddresses.push(_user);
            isAlreadyPurchased[_user] = true;
        }
        User storage user = users[_user];
        user.tokenIds.push(_tokenId);
    }

    function _userBorrow(address _user) internal {
        User storage user = users[_user];
        user.numBorrowing++;
    }

    function _userReturn(address _user) internal {
        User storage user = users[_user];
        user.numBorrowing--;
    }
}