// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

contract Library {
    struct Book {
        string title;
        string id;
        uint lendingPeriod;
        uint price; // yen
        uint stock;
        uint numBorrowed;
        uint numSaled;
        bool isFullBorrowed;
        // user address => boolean
        mapping(address => bool) borrowerTable;
        address[] borrower;
    }

    struct User {
        address userAddress;
        uint numBorrow;
        uint[] borrowedBooks;
        uint[] purchasedBooks;
        // book id : boolean
        mapping(uint => bool) borrowTable;
    }

    struct BorrowedBook {
        uint bookIndex;
        address borrowerAddress;
        uint returnDate;
    }

    address public manager;
    uint public countUser;
    uint public maxBorrowing;
    mapping(address => User) public users;
    mapping(address => bool) public validUser;
    mapping(address => bool) private staff;

    uint public numBooks;
    mapping( uint => Book ) public books;

    // period(returnDate) => BrrowedBook[]
    uint public numBorrowedBooks;
    mapping( uint => BorrowedBook) BorrowedBooks;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    modifier staffControled() {
        require(staff[msg.sender]);
        _;
    }

    constructor(uint maxBorrowingNumber) {
        manager = msg.sender;
        maxBorrowing = maxBorrowingNumber;
        staff[msg.sender] = true;
    }

    // Register a user
    function register () public {
        require(!validUser[msg.sender]);
        validUser[msg.sender] = true;
        User storage user = users[msg.sender];
        user.userAddress = msg.sender;
        user.numBorrow = 0;
        countUser++;
    }

    // Borrow Book
    function borrowBook(uint index) public {
        require(validUser[msg.sender]);

        // Book section
        Book storage book = books[index];
        require(book.numBorrowed < book.stock);
        require(!book.isFullBorrowed);
        require(!book.borrowerTable[msg.sender]);

        book.numBorrowed++;
        if(book.numBorrowed == book.stock){
            book.isFullBorrowed = true;
        }
        book.borrower.push(msg.sender);
        book.borrowerTable[msg.sender] = true;

        // User section
        User storage user = users[msg.sender];
        require(user.numBorrow < maxBorrowing);
        user.borrowedBooks.push(index);
        user.borrowTable[index] = true;
        user.numBorrow++;

        BorrowedBook storage borrowedBook = BorrowedBooks[numBorrowedBooks++];
        borrowedBook.bookIndex = index;
        borrowedBook.borrowerAddress = user.userAddress;
        // Make helper function after!!!!!!!!
        borrowedBook.returnDate = block.timestamp + book.lendingPeriod days;
    }

    // Reserve Book => Implement Later!!!
    // Buy Book => Implement Later!!!
    function buyBook(uint index) public payable{
        Book storage book = books[index];
        require(book.price == msg.value);
        book.numSaled++;

        User storage user = users[msg.sender];
        user.purchasedBooks.push(index);
    }

    // Return Book
    function returnBook(uint index) public {
        require(index < numBooks);
        require(validUser[msg.sender]);

        Book storage book = books[index];
        User storage user = users[msg.sender];

        require(book.borrowerTable[msg.sender]);
        require(user.borrowTable[index]);

        // Book section
        book.borrowerTable[msg.sender] = false;
        book.numBorrowed--;
        book.isFullBorrowed = false;
        
        // User section
        user.borrowTable[index] = false;
        user.numBorrow--;
    }

    // Retrieve user Information
    function getUserInformation() public view returns (uint, uint, uint){
        User storage user = users[msg.sender];
        return (user.numBorrow, user.borrowedBooks.length, user.purchasedBooks.length);
    }

    //=====Library Staff & Manager side================================================

    // Invite Staff
    function inviteStaff(address staffAddress) public restricted {
        staff[staffAddress] = true;
    }

    // Add new Book
    function addBook(
            string memory title,
            string memory id,
            uint period,
            uint price,
            uint stock
        ) public restricted {
            Book storage book = books[numBooks++];
            book.title = title;
            book.id=id;
            book.lendingPeriod = period;
            book.price = price;
            book.stock = stock;
            book.numBorrowed = 0;
            book.isFullBorrowed = false;
            book.numSaled = 0;
    }

    // Modify Book
    function modifyInformation(
        uint index,
        string memory title,
        string memory id,
        uint period,
        uint price,
        uint stock
    ) public staffControled{
        require(index < numBooks);
        Book storage book = books[index];
        require(book.stock >= stock);

        book.title = title;
        book.id=id;
        book.lendingPeriod = period;
        book.price = price;
        book.stock = stock;
        if(book.stock == book.numBorrowed){
            book.isFullBorrowed = true;
        }
    }
}