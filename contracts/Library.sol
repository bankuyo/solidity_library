// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";

import './devs/TokenManager.sol';
import './devs/BookManager.sol';
import './devs/UserManager.sol';

// all payable functions are to implement here
contract Library is TokenManager, BookManager, UserManager, Ownable{
    uint public maxBorrowing;
    constructor(uint _maxBorrowing){
        maxBorrowing = _maxBorrowing;
    }

    // change max Borrowing number
    function changeMaxBorrowing(uint _maxBorrowing) external onlyOwner {
        maxBorrowing = _maxBorrowing;
    }

    // add book
    function addBook(address _author, uint _price, string memory _title) external onlyOwner {
        _addBook(_author, _price, _title);
    }

    // modify book
    function modifyBook(uint _bookId,address _author, uint _price, string memory _title) external onlyOwner {
        _modifyBook(_bookId,_author, _price, _title);
    }

    // purchase Book
    function purchaseBook(uint _bookId) external payable {
        _purchaseBook(_bookId, msg.sender , msg.value);
        _purchaseToken(_bookId, msg.sender);
        uint tokenId = totalSupply();
        _userPurchase(msg.sender, tokenId);
    }

    // borrow Book
    function borrowBook(uint _tokenId ) external restrictedBorrow(msg.sender, maxBorrowing) payable{
        address owner = ownerOf(_tokenId);
        _borrowToken(_tokenId, owner, msg.sender, msg.value);
        _userBorrow(msg.sender);
    }

    // return Book
    function returnBook(uint _tokenId) external {
        address owner = ownerOf(_tokenId);
        address borrower = getTokenBorrower(_tokenId);
        _returnToken(_tokenId, owner);
        _userReturn(borrower);
    }

    // configure token
    function configBorrow(uint _tokenId, uint _period, uint _cost) external {
        address owner = ownerOf(_tokenId);
        require(owner == msg.sender);
        _configBorrow(_tokenId, _period, _cost);
    }
    function changeBorrowAllowance(uint _tokenId, bool _isAllow) external {
        address owner = ownerOf(_tokenId);
        require(owner == msg.sender);
        _changeBorrowAllowance(_tokenId, _isAllow);
    }

}