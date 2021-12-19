// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
import './devs/BookManager.sol';
import './devs/UserManager.sol';
import './devs/TokenManager.sol';

contract Library {
    address public owner;
    mapping(address => bool) staff;

    BookManager private bookManager;
    UserManager private userManager;
    TokenManager private tokenManager;

    uint public maxBorrowing;

    modifier restricted() {
        require(owner == msg.sender);
        _;
    }

    modifier userRestricted(){
        require(userManager.getIsValidUser(msg.sender));
        _;
    }

    modifier staffRestricted(){
        require(userManager.getIsStaff(msg.sender));
        _;
    }

    constructor (uint _maxBorrowing) {
        owner = msg.sender;
        bookManager = new BookManager(owner);
        userManager = new UserManager(owner);
        tokenManager = new TokenManager(owner);
        maxBorrowing = _maxBorrowing;
    }

    // Invite staff
    function inviteStaff(address _staffAddress) public restricted{
        staff[_staffAddress] = true;
    }

    // Add Book
    function addBook(string memory _bookid, string memory _title, uint _price, address _authorAddress) public restricted {
        bookManager.addBook(_bookid, _title, _price, _authorAddress);
    }

    // Modify Book
    function modifyBook( uint _index, string memory _bookid, string memory _title, uint _price, address _authorAddress)
        public {
            require(staff[msg.sender]);
            bookManager.modifyBook(_index, _bookid, _title, _price, _authorAddress);
    }

    // Create book token
    function createBookToken(uint _bookIndex, uint _period, uint _cost) public userRestricted payable {
        uint price = bookManager.getBookPrice(_bookIndex);
        require(price == msg.value);
        uint tokenId = tokenManager.createBookToken(msg.sender, _bookIndex, _period, _cost);
        userManager.purchased(msg.sender, tokenId);
    }

    // Borrow book
    function borrowBook(uint _tokenId) public userRestricted payable {
        uint cost = tokenManager.getTokenCost(_tokenId);
        uint bookIndex = tokenManager.getTokenBookId(_tokenId);
        require(cost == msg.value);
        tokenManager.changeReader(_tokenId, msg.sender);
        userManager.borrowed(msg.sender, _tokenId);
        bookManager.tokenCreated(bookIndex);   
    }

    // Return book
    function returnBook(uint _tokenId) public userRestricted {
        tokenManager.returnBook(_tokenId);
        userManager.returned(msg.sender, _tokenId);
    }
}