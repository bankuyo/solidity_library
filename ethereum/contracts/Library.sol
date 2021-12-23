// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./devs/BorrowManager.sol";

contract Library is ERC721Enumerable, Ownable, BorrowManager{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // ERC721( name, symbol )
    constructor() ERC721("LibraryBookToken", "LBT") {}

    function purchaseBook(address _user, uint _bookId) public returns (uint256){
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(_user, newTokenId);
        _initializeToken(newTokenId,_user, _bookId);
        return newTokenId;
    }
}