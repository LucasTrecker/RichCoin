// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./IPayToken.sol";
import "./IDex.sol";

contract PayToken is ERC20, IPayToken{

    //Evtl. safeErc20 lib?
    //validRichCoinSigs??
    mapping(bytes32 => mapping(bytes32 => uint256)) private _dexRichcoinValidUntil;



    constructor() ERC20("PayToken", "PAY"){
        _mint(msg.sender, 10**24);
    }

    function transferTokenToDex(uint256 _amount, address _sender) external override{ //address(this).code im constructor falsch, signatur nach Erstellung hinzufügen
        IDex dex = IDex(msg.sender);
        bytes32 dexHashed = address(dex).codehash;
        bytes32 richHashed = address(dex.getRichCoin()).codehash;
        require(_dexRichcoinValidUntil[dexHashed][richHashed] > dex.getCreated(), "Contract pair not valid");
        //tx.origin weg und msg.sender übergeben -> Durch Prüfung ob sender DEX weiß man dass der Parameter von DEX gesetzt wurde
        transferInternal(_sender, address(dex), _amount);
    }

    function insertValidContractByDex(address _contractAddress) public{ //NUR OWNER; Später vielleicht direkt Hash (billiger);
        bytes32 dexHashed = _contractAddress.codehash;
        bytes32 richHashed = address(IDex(_contractAddress).getRichCoin()).codehash;
        _dexRichcoinValidUntil[dexHashed][richHashed] = 9999999999;
    }

    function insertValidContractByDexAndRichcoin(address _dexAddress, address _richAddress) public{ //NUR OWNER; Später vielleicht direkt Hash (billiger);
        bytes32 dexHashed = _dexAddress.codehash;
        bytes32 richHashed = _richAddress.codehash;
        _dexRichcoinValidUntil[dexHashed][richHashed] = 9999999999;
    }

    function setValidUntilByDex(address _contractAddress, uint256 __dexRichcoinValidUntil) public {
        bytes32 richHashed = address(IDex(_contractAddress).getRichCoin()).codehash;
        _dexRichcoinValidUntil[_contractAddress.codehash][richHashed] = __dexRichcoinValidUntil;
    }

    function setValidUntilByDexAndRichCoin(address _dexAddress, address _richAddress, uint256 __dexRichcoinValidUntil) public {
        _dexRichcoinValidUntil[_dexAddress.codehash][_richAddress.codehash] = __dexRichcoinValidUntil;
    }

    function isValidUntilByDex(address _contractAddress) public view returns (uint256) { //NUR OWNER; Später vielleicht direkt Hash (billiger);
        bytes32 richHashed = address(IDex(_contractAddress).getRichCoin()).codehash;
        return _dexRichcoinValidUntil[_contractAddress.codehash][richHashed];
    }

    function isValidUntilByDexAndRichCoin(address _dexAddress, address _richAddress) public view returns (uint256) { //NUR OWNER; Später vielleicht direkt Hash (billiger);
        return _dexRichcoinValidUntil[_dexAddress.codehash][_richAddress.codehash];
    }

    function isValidContractByDexAndRichCoin(address _dexAddress, address _richAddress) public view returns (bool){
        return IDex(_dexAddress).getCreated() < _dexRichcoinValidUntil[_dexAddress.codehash][_richAddress.codehash];
    }

    function isValidContractByDex(address _dexAddress) public view returns (bool){
        bytes32 richHashed = address(IDex(_dexAddress).getRichCoin()).codehash;
        return IDex(_dexAddress).getCreated() < _dexRichcoinValidUntil[_dexAddress.codehash][richHashed];
    }

    
}