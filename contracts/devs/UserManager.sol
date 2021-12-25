// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

contract UserManager {
    struct User {
        uint numBorrowing;
    }

    modifier restrictedBorrow(address _user, uint _maxBorrowing){
        User memory user = users[_user];
        require(_maxBorrowing >user.numBorrowing);
        _;
    }
    
    mapping(address => User) users;

    function getBorrowingNum(address _user) external view returns(uint){
        User memory user = users[_user];
        return user.numBorrowing;
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