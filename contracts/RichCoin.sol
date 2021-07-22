// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract RichCoin is ERC721{
    
    address[] public addresses;
    mapping(address => bool) _addressExists;

    constructor() ERC721("RichCoinNFT", "RICH") {
        mint("test", msg.sender); //Muss dann IERC721Receiver sein, wie umsetzen bei "normalen Adressen"?
    }
    

    //Wie Kosten bezahlen
    function mint(string memory _name, address _address) public { //Adresse per msg.sender oder mitgeben bei mint()-Funktion per web3?
        require(!_addressExists[_address]);
        addresses.push(_address);
        uint256 _id = addresses.length; //id direkt beim push zuweisen?
        _mint(_address, _id);
        _addressExists[_address] = true;
    }

    string test;

    event EmitString(string test);

    function set(string memory _test) public {
        test=_test;
    }

    function get() external returns (string memory) {
        emit EmitString(test);
        return test;
    }


}