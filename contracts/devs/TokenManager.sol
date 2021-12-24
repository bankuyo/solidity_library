// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import './BorrowTokenManager.sol';

contract TokenManager is ERC721Enumerable, BorrowTokenManager{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // ERC721( name, symbol )
    constructor() ERC721("LibraryBookToken", "LBT") {}

    function _purchaseToken(uint _bookId, address _purchaser) internal returns (uint256){
        _tokenIds.increment();
        uint newTokenId = _tokenIds.current();

        _safeMint(_purchaser, newTokenId);
        _initializeToken(newTokenId,_purchaser, _bookId);
        return newTokenId;
    }
}