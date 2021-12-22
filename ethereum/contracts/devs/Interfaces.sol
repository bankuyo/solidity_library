// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

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
        uint _price,
        address _authorAddress) external;
}

// Depends on Book Manager
interface TokenManagerInterface {
    struct BookToken {
        uint tokenId;
        address owner;
        uint bookIndex;
        address reader;
        bool allowToContract;
        uint period;
        uint cost;
    }

    // Require book author approval
    // Is it nessary to be payable ? 
    function createBookToken(address _sender, uint _bookId, uint _period, uint _cost) external returns(uint);

    // Contract token functions
    function changeAllowabilityStatus(uint _tokenId, bool _status) external;
    function changeContractStatus(uint _tokenId, uint _period, uint _cost) external;
    function changeReader(uint _tokenId, address _reader) external;
    function returnBook(uint _tokenId) external;
}

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

