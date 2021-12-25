// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";

import './devs/TokenManager.sol';
import './devs/BookManager.sol';

// all payable functions are to implement here
contract Library is TokenManager, BookManager, Ownable{

    // add book
    function addBook(address _author, uint _price) external onlyOwner {
        _addBook(_author, _price);
    }

    // modify book
    function modifyBook(uint _bookId,address _author, uint _price) external onlyOwner {
        _modifyBook(_bookId,_author, _price);
    }

    // purchase Book
    function purchaseBook(uint _bookId) external payable {
        _purchaseBook(_bookId, msg.sender , msg.value);
        _purchaseToken(_bookId, msg.sender);
    }

    // borrow Book
    function borrowBook(uint _tokenId ) external payable{
        address owner = ownerOf(_tokenId);
        _borrowToken(_tokenId, owner, msg.sender, msg.value);
    }

    // return Book
    function returnBook(uint _tokenId) external {
        address owner = ownerOf(_tokenId);
        _returnToken(_tokenId, owner);
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