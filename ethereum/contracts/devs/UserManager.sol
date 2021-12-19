// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

// import {UserManagerInterface} from './Interfaces.sol';
interface UserManagerInterface {
    struct User {
        address userAddress;
        uint userId;
        uint numBorrowing;

        uint numBorrowed;
        uint[] borrowingBooksId;
        // book id => index
        mapping(uint => uint) searchBorrowingBookIndex;
        mapping(uint => bool) isBorrowedTable;

        uint numPurchased;
        uint[] purchasedBooksId;
        mapping(uint => uint) searchPurchasedBookIndex;
    }

    // Register user
    function register(address _sender) external;

    // After contracting care functions
    function returned(address _sender, uint _tokenId) external;
    function borrowed(address _sender, uint _tokenId) external;
    function purchased(address _sender, uint _bookId) external;   
}

contract UserManager is UserManagerInterface{
    address public owner;
    address private contractAddress;

    uint public numUser;
    mapping(address => User) public users;
    mapping(address => bool) public isValidUser;

    uint public numStaff;
    mapping(address => bool) isStaff;

    modifier restricted(){
        require(contractAddress == msg.sender);
        _;
    }

    constructor (address _ownerAddress){
        owner = _ownerAddress;
        contractAddress = msg.sender;
    }

    function register(address _sender) public restricted {
        require(!isValidUser[_sender]);
        isValidUser[_sender] = true;
        User storage user = users[_sender];
        user.userAddress = _sender;
        user.numBorrowing = 0;
        user.numBorrowed  = 0;
        user.numPurchased = 0;
    }

    function InviteStaff(address _staffAddress) public restricted {
        isStaff[_staffAddress] = true;
    }

    // valid if user actually borrowed / not borrowed===========================

    function borrowed(address _sender, uint _tokenId) public restricted{
        require(isValidUser[_sender]);

        User storage user = users[_sender];
        user.borrowingBooksId.push(_tokenId);
        user.searchBorrowingBookIndex[_tokenId] = user.numBorrowed;
        user.isBorrowedTable[_tokenId] = true;
        user.numBorrowing++;
        user.numBorrowed++;
    }

    function returned(address _sender, uint _tokenId) public restricted{
        require(isValidUser[_sender]);
        User storage user = users[_sender];
        user.isBorrowedTable[_tokenId] = false;
        user.numBorrowing--;
    }

    function purchased(address _sender, uint _tokenId) public restricted{
        require(isValidUser[_sender]);

        User storage user = users[_sender];
        user.purchasedBooksId.push(_tokenId);
        user.searchPurchasedBookIndex[_tokenId] = user.numPurchased;
        user.numPurchased++;
    }

    // External functions
    function getIsValidUser(address _userAddress) external view returns(bool){
        return isValidUser[_userAddress];
    }

    function getIsStaff(address _staffAddress) external view returns(bool){
        return isStaff[_staffAddress];
    }
}