// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./IPayToken.sol";
import "./IDex.sol";

contract PayToken is ERC20, IPayToken{

    //Evtl. safeErc20 lib?
    //validRichCoinSigs??
    mapping(bytes32 => bool)    private _isValidContract;
    mapping(bytes32 => uint256) private _validUntil;



    constructor() ERC20("PayToken", "PAY"){
        _mint(msg.sender, 10**24);
    }

    function transferTokenToDex(uint256 _amount, address _sender) external override{ //address(this).code im constructor falsch, signatur nach Erstellung hinzufügen
        IDex dex = IDex(msg.sender);
        bytes32 hashed = address(dex).codehash;
        require(_isValidContract[hashed], "Contract is not valid");
        require(_validUntil[hashed] > dex.getCreated(), "Contract was created too late and is not valid anymore");
        //tx.origin weg und msg.sender übergeben -> Durch Prüfung ob sender DEX weiß man dass der Parameter von DEX gesetzt wurde
        transferInternal(_sender, address(dex), _amount);
    }

    function insertValidContract(address _contractAddress) public{ //NUR OWNER; Später vielleicht direkt Hash (billiger);
        bytes32 hashed = _contractAddress.codehash;
        _isValidContract[hashed] = true;
        _validUntil[hashed] = 9999999999;
    }

    function set_validUntil(address _contractAddress, uint256 __validUntil) public {
        _validUntil[_contractAddress.codehash] = __validUntil;
    }

    function isValidContract(address _contractAddress) public view returns (uint256) { //NUR OWNER; Später vielleicht direkt Hash (billiger);
        return _validUntil[_contractAddress.codehash];
    }

    
}