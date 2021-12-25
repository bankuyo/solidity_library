// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/utils/Counters.sol";

// Book Manager
contract BookManager {
    using Counters for Counters.Counter;
    Counters.Counter private _bookIds;

    struct Book{
        address author;
        uint price;
        Counters.Counter purchasedIds;
        address[] purchaser;
    }
    mapping(uint => Book) Books;

    modifier bookIsExist(uint _bookId) {
        require(_bookId <= _bookIds.current());
        _;
    }

    function _purchaseRequirement(Book memory book, uint _payment) internal pure{
        require(book.price == _payment);
    }

    function _addBook(address _author, uint _price) internal {
        _bookIds.increment();
        Book storage book = Books[_bookIds.current()];
        book.author = _author;
        book.price = _price;
    }

    function _modifyBook(uint _bookId,address _author, uint _price) internal {
        Book storage book = Books[_bookId];
        book.author = _author;
        book.price = _price;
    }

    function getPurchaser(uint _bookId) external bookIsExist(_bookId) view returns(address[] memory) {
        Book memory book = Books[_bookId];
        return book.purchaser;
    }

    function getTotalBook() external view returns(uint){
        return _bookIds.current();
    }

    function getBookData(uint _bookId) external view returns(Book memory) {
        Book memory book = Books[_bookId];
        return book;
    }


    function _purchaseBook(uint _bookId, address _purchaser, uint _payment) internal virtual bookIsExist(_bookId){
        Book storage book = Books[_bookId];
        _purchaseRequirement(book, _payment);
        book.purchaser.push(_purchaser);
    }

}