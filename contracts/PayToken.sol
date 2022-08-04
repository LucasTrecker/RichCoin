// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./IPayToken.sol";

contract PayToken is ERC20, IPayToken{

    //Evtl. safeErc20 lib?

    mapping(bytes32 => bool) validContractSignature;



    constructor() ERC20("PayToken", "PAY"){
        _mint(msg.sender, 10**24);
    }

    function transferTokenToDex(uint256 _amount) external override{ //address(this).code im constructor falsch, signatur nach Erstellung hinzufügen
        address dex = msg.sender;
        require(validContractSignature[keccak256(dex.code)], "Invalid Contract");
        transferInternal(tx.origin, dex, _amount);
    }

    function insertValidContract(address contractAddress) public{ //NUR OWNER; Später vielleicht direkt Hash (billiger);
        validContractSignature[keccak256(contractAddress.code)] = true;
    }

    function isValidContract(address contractAddress) public view returns (bool) { //NUR OWNER; Später vielleicht direkt Hash (billiger);
        return validContractSignature[keccak256(contractAddress.code)];
    }


}