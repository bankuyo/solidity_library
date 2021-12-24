// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

contract BorrowTokenManager {
    struct BorrowToken{
        address borrower;
        uint bookId;
        bool allowToContract;

        uint period;
        uint cost;
        uint start;
    }

    mapping(uint => BorrowToken) tokenData;

    function _borrowRequirement(BorrowToken memory _token, address _tokenOwner, uint _payment) internal virtual pure {
        require(_token.cost == _payment);
        require(_token.borrower == _tokenOwner);
    }

    function _returnRequirement(BorrowToken memory _token, address _tokenOwner, address _sender) internal virtual {
        if(block.timestamp >= _token.start + _token.period * 1 days){
            require(_token.borrower == _sender || _tokenOwner == _sender);
        } else require(_token.borrower == _sender);
    }

    function _initializeToken(uint _tokenId,address _tokenOwner, uint _bookId) internal virtual {
        BorrowToken storage token = tokenData[_tokenId];
        token.borrower = _tokenOwner;
        token.bookId = _bookId;
        token.allowToContract=false;
        token.period = 1;
        token.cost = 0;
        token.start = 0;
    }

    function getTokenData(uint _tokenId) external virtual view returns(BorrowToken memory){
        return tokenData[_tokenId];
    }

    function getTokenBorrower(uint _tokenId) external virtual view returns(address){
        BorrowToken memory token = tokenData[_tokenId];
        return token.borrower;
    }

    function _borrowToken(uint _tokenId, address _tokenOwner, address _borrower, uint _payment) internal virtual{
        BorrowToken storage token = tokenData[_tokenId];
        _borrowRequirement(token, _tokenOwner, _payment );
        token.borrower = _borrower;
        token.start = block.timestamp;
    }

    function _returnToken(uint _tokenId, address _tokenOwner) internal virtual {
        BorrowToken storage token = tokenData[_tokenId];
        _returnRequirement(token, _tokenOwner, msg.sender);

        token.borrower = _tokenOwner;
        token.start = 0;
    }
}