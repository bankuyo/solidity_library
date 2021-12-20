// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
import './devs/BookManager.sol';
import './devs/UserManager.sol';
import './devs/TokenManager.sol';

contract Library {
    address public owner;
    mapping(address => bool) public staff;

    BookManager private bookManager;
    UserManager private userManager;
    TokenManager private tokenManager;
    address[] managerAddress;

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
        staff[owner] = true;
        bookManager = new BookManager(owner);
        userManager = new UserManager(owner);
        tokenManager = new TokenManager(owner);
        managerAddress.push(address(bookManager));
        managerAddress.push(address(userManager));
        managerAddress.push(address(tokenManager));
        maxBorrowing = _maxBorrowing;
    }

    // Invite staff
    function inviteStaff(address _staffAddress) public restricted{
        staff[_staffAddress] = true;
    }

    // Register user
    function register() public {
        userManager.register(msg.sender);
    }

    // Add Book
    function addBook(string memory _bookId, string memory _title, uint _price, address _authorAddress) public restricted {
        require(!bookManager.getIsStoredBook(_bookId));
        bookManager.addBook(_bookId, _title, _price, _authorAddress);
    }

    // Modify Book
    function modifyBook( uint _index, string memory _bookId, string memory _title, uint _price, address _authorAddress)
        public {
            require(staff[msg.sender]);
            bookManager.modifyBook(_index, _bookId, _title, _price, _authorAddress);
    }

    // Create book token 
    function createBookToken(uint _bookIndex, uint _period, uint _cost) public userRestricted payable {
        uint price = bookManager.getBookPrice(_bookIndex);
        require(price == msg.value);
        uint tokenId = tokenManager.createBookToken(msg.sender, _bookIndex, _period, _cost);
        userManager.purchased(msg.sender, tokenId);
        bookManager.tokenCreated(_bookIndex);   
    }

    // Change the status to make automaticly contract token
    function allowTokenToContract(uint _tokenId, bool _status) public userRestricted payable {
        tokenManager.changeAllowabilityStatus(_tokenId, _status);
    }

    // Borrow book
    function borrowBook(uint _tokenId) public userRestricted payable {
        uint cost = tokenManager.getTokenCost(_tokenId);
        bool tokenIsAllow = tokenManager.getTokenIsAllowed(_tokenId);
        uint numBorrowing = userManager.getNumBorrowing(msg.sender);
        require(tokenIsAllow);
        require(numBorrowing < maxBorrowing);
        require(cost == msg.value);
        tokenManager.changeReader(_tokenId, msg.sender);
        userManager.borrowed(msg.sender, _tokenId);
    }

    // Return book
    function returnBook(uint _tokenId) public userRestricted {
        address reader = tokenManager.getTokenReader(_tokenId);
        require(reader == msg.sender);
        tokenManager.returnBook(_tokenId);
        userManager.returned(msg.sender, _tokenId);
    }

    // Retreive Manager address
    function getManagerAddress() external restricted view returns(address[] memory){
        return managerAddress;
    }
}