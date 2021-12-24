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

    // purchase Book
    function purchaseBook(uint _bookId, address _purchaser) external payable {
        require(msg.sender == _purchaser);
        _purchaseBook(_bookId, _purchaser, msg.value);
        _purchaseToken(_bookId, _purchaser);
    }

    // borrow Book
    function borrowBook(uint _tokenId, address _tokenOwner, address _borrower) external payable{
        require(msg.sender == _borrower);
        _borrowToken(_tokenId, _tokenOwner, _borrower, msg.value);
    }

    // return Book
    function returnBook(uint _tokenId, address _tokenOwner) external {
        address owner = ownerOf(_tokenId);
        require(owner == _tokenOwner);
        _returnToken(_tokenId, _tokenOwner);
    }
}