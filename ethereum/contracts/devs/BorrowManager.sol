// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

contract BorrowManager {
    struct BorrowToken {
        address borrower;
        uint bookId;
        bool allowToContract;
        uint period;
        uint cost;
    }

    mapping(uint => BorrowToken) tokenData;

    function _borrowRequirement(BorrowToken memory _token, address _tokenOwner, uint _value) internal virtual {
        require(_token.cost == _value);
        require(_token.borrower == _tokenOwner);
    }

    function _initializeToken(uint _tokenId,address _tokenOwner, uint _bookId) internal virtual {
        BorrowToken storage token = tokenData[_tokenId];
        token.borrower = _tokenOwner;
        token.bookId = _bookId;
        token.allowToContract=false;
        token.period = 0;
        token.cost = 0;
    }

    function getTokenData(uint _tokenId) external virtual view returns(BorrowToken memory){
        return tokenData[_tokenId];
    }

    function getTokenBorrower(uint _tokenId) external virtual view returns(address){
        BorrowToken memory token = tokenData[_tokenId];
        return token.borrower;
    }

    function rentToken(uint _tokenId, address _tokenOwner, address _borrower) external virtual payable{
        BorrowToken storage token = tokenData[_tokenId];
        _borrowRequirement(token, _tokenOwner, msg.value);
        token.borrower = _borrower;
    }

    function returnToken(uint _tokenId, address _tokenOwner, address _borrower) external virtual {
        BorrowToken storage token = tokenData[_tokenId];
        require(token.borrower == _borrower);
        token.borrower = _tokenOwner;
    }
}