// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

// import {TokenManagerInterface} from './Interfaces.sol';
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


contract TokenManager is TokenManagerInterface {
    address public owner;
    address public contractAddress;

    uint public numBookToken;
    mapping(uint => BookToken) public bookTokens;

    modifier restricted(){
        require(contractAddress == msg.sender);
        _;
    }

    modifier verifyToken(uint tokenId){
        require(tokenId < numBookToken);
        _;
    }

    constructor (address _ownerAddress){
        owner = _ownerAddress;
        contractAddress = msg.sender;
    }

    // Require book author approval
    // Pay token cost at Parent Contract=============
    function createBookToken(address _sender, uint _bookIndex, uint _period, uint _cost ) public restricted returns(uint){
        BookToken storage bookToken = bookTokens[numBookToken];
        bookToken.tokenId = numBookToken;
        bookToken.bookIndex = _bookIndex;
        bookToken.owner = _sender;
        bookToken.reader = _sender;
        bookToken.allowToContract = false;
        bookToken.period = _period;
        bookToken.cost = _cost;
        numBookToken++;
        return bookToken.tokenId;
    }

    // Contract token functions
    // Verify token id could be more restricted and be appropreate
    function changeAllowabilityStatus(uint _tokenId, bool _status) public verifyToken(_tokenId) restricted{
        BookToken storage bookToken = bookTokens[_tokenId];
        bookToken.allowToContract = _status;
    }

    function changeContractStatus(uint _tokenId, uint _period, uint _cost) public verifyToken(_tokenId) restricted{
        BookToken storage bookToken = bookTokens[_tokenId];
        bookToken.period = _period;
        bookToken.cost = _cost;
    }

    function changeReader(uint _tokenId, address _reader) public verifyToken(_tokenId) restricted{
        BookToken storage bookToken = bookTokens[_tokenId];
        bookToken.reader = _reader;
    }

    function returnBook(uint _tokenId) public verifyToken(_tokenId) restricted{
        BookToken storage bookToken = bookTokens[_tokenId];
        changeReader(_tokenId, bookToken.owner);
    }

    // External functions
    function getTokenCost(uint _tokenId) external view returns(uint){
        BookToken memory bookToken = bookTokens[_tokenId];
        return bookToken.cost;
    }

    function getTokenReader(uint _tokenId) external view returns(address){
        BookToken memory bookToken = bookTokens[_tokenId];
        return bookToken.reader;
    }

    function getTokenIsAllowed(uint _tokenId) external view returns(bool){
        BookToken memory bookToken = bookTokens[_tokenId];
        return bookToken.allowToContract;
    }

    function getTokenBookId(uint _tokenId) external view returns(uint){
        BookToken memory bookToken = bookTokens[_tokenId];
        return bookToken.bookIndex;
    }

}