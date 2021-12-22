// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

// import {BookManagerInterface} from './Interfaces.sol';
interface BookManagerInterface {
    struct BookInformation {
        string bookId;
        string title;
        uint price;
        uint numToken;
        address authorAddress;
    }

    event AddBook(uint indexed _index);
    function addBook(
        string memory _bookid,
        string memory _title,
        uint _price,
        address _authorAddress) external;

    event ModifyBook(uint indexed _index);
    function modifyBook(
        uint _index,
        string memory _bookid,
        string memory _title,
        uint _price
        ) external;

    function changeAuthorAddress(uint _bookIndex, address _authorAddress) external;
}

contract BookManager is BookManagerInterface {
    address public owner;
    address private contractAddress;

    uint public numBook;
    mapping(uint => BookInformation) public bookInformations;

    // book id => true/false
    mapping(string => bool) public isStoredBook;

    modifier restricted(){
        require(contractAddress == msg.sender);
        _;
    }

    constructor (address _ownerAddress){
        owner = _ownerAddress;
        contractAddress = msg.sender;
    }

    function addBook( string memory _bookId, string memory _title, uint _price, address _authorAddress) 
        public restricted {
        BookInformation storage book = bookInformations[numBook++];
        book.bookId = _bookId;
        book.title = _title;
        book.price = _price;
        book.numToken = 0;
        book.authorAddress = _authorAddress;

        isStoredBook[_bookId] = true;
    }

    function modifyBook( uint _bookIndex, string memory _bookid, string memory _title, uint _price)
        public restricted {
        // Need implementing staff
        BookInformation storage book = bookInformations[_bookIndex];
        book.bookId = _bookid;
        book.title = _title;
        book.price = _price;
        book.numToken = 0;
    }

    function changeAuthorAddress(uint _bookIndex, address _authorAddress) public restricted{
        BookInformation storage book = bookInformations[_bookIndex];
        book.authorAddress = _authorAddress;
    }

    // External functions
    function getBookPrice(uint _bookIndex) external view returns(uint){
        BookInformation memory bookInformation = bookInformations[_bookIndex];
        return bookInformation.price;
    }

    function getBookInformation(uint _bookIndex) external view 
        returns(string memory, string memory, uint, uint, address){
            BookInformation memory bookInformation = bookInformations[_bookIndex];
            return (
                bookInformation.bookId,
                bookInformation.title,
                bookInformation.price,
                bookInformation.numToken,
                bookInformation.authorAddress
            );
    }

    function getIsStoredBook(string memory _bookId) external view returns(bool){
        return isStoredBook[_bookId];
    }

    function tokenCreated(uint _bookIndex) external {
        BookInformation storage bookInformation = bookInformations[_bookIndex];
        bookInformation.numToken++;
    }
}