
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IRichCoin.sol";
import "./openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PayToken.sol";

contract DEX is ERC721Holder, ReentrancyGuard{
    PayToken private payToken;
    IRichCoin private coin;
    uint256 private _basis;
    uint256 private _deadline;
    uint256 private _auctionStart;
    bool private _auctionStarted = false;
    uint256 private _deadlineLength;
    uint256 private _startPrice; //Startpreis festlegen, müsste unten multipliziert werden
    uint256 private _provision = 2;
    uint256 _personenZaehler = 1;
    event NewOwner(address indexed _owner, uint256 _counter, uint256 _pricePaid, string _message); //Eventuell noch Message hinzufügen, gehasht oder nicht gehasht
    event NewDeadline(uint256 _deadline);
    event AuctionEnded(bool _ended);
    uint256 private _amountToPay;

    constructor(address richCoinAddress, uint256 auctionStart, uint256 deadlineLength, uint256 startPrice, uint256 basis) {
        require(basis > 100, "Base is too low");
        require((startPrice*basis)/100 > startPrice, "Invalid price increase");
        //require(auctionStart > block.timestamp, "Auction start is not in the future"); //Wobei vielleicht Auktion direkt beginnen
        //Validierung ob Prozentsatz valid
        //Über Backend checken ob bytecode valid oder hier rüber mit web3
        _auctionStart = auctionStart;
        _deadlineLength = deadlineLength;
        _startPrice = startPrice;
        _basis = basis;
        _amountToPay = ((_startPrice*_basis)/100);
        coin = IRichCoin(richCoinAddress);
        payToken = PayToken( 0x5DE511f786c4a7588511a233e1b92A7D3FC172c2); //Proxy?
        newDeadline(_auctionStart + _deadlineLength);
        emit NewOwner(tx.origin, _personenZaehler, _startPrice, "I'm fucking poor");
    }

    function newDeadline(uint256 _newDeadline) internal {
        _deadline = _newDeadline;
        emit NewDeadline(_deadline);
    }

    fallback() external payable{
    }

    receive() external payable{

    }

    function addNewOwner(address _newOwner, string memory message) internal{
        _personenZaehler++;
        emit NewOwner(_newOwner, _personenZaehler, _amountToPay, message);
        coin.addNewOwner(msg.sender, message);
    }

    function paybackLastOne(uint256 _amount) internal{
        bool sent = payToken.transfer(coin.getOwnerByOrder(_personenZaehler), _amount);
        if(sent){
            coin.addEarning(coin.getOwnerByOrder(_personenZaehler), _amount); 
        }
    }

        function paybackAll(uint256 rest) internal{
            for(uint256 i=1; i<=_personenZaehler; i++){                                                
                //uint256 amountToSenddd = ((((_startPrice*(_basis**_personenZaehler))/(100**_personenZaehler))-(((_startPrice*(_basis**(_personenZaehler-1)))/100**(_personenZaehler-1))))/(2**(i+1))); Geht
                //uint256 amountToSendd = ((_startPrice*((_basis)**(_personenZaehler))/(100**_personenZaehler))-(_startPrice*((_basis)**(_personenZaehler-1)/(100**(_personenZaehler-1)))))/(2**(i+1)); Geht nicht
                uint256 amountToSend = (rest/(2**(i)));
                if(i == _personenZaehler){
                    amountToSend += (rest/(2**(i)));
                }
                //Letzter Owner bekommt den "Rest der übrigen funds", also so viel wie der vorher
                if(amountToSend!=0){
                    bool sent = payToken.transfer(coin.getOwnerByOrder(i), amountToSend);
                    if(sent){
                    coin.addEarning(coin.getOwnerByOrder(i), amountToSend);
                    }
                }
            }
        }

        function paybackProvision(uint256 remaining) internal {
            bool sent = payToken.transfer(0x2d48A3957C7246f5630A2CFF2fcBDf737e0177b4, remaining);
            if(sent){
                coin.addEarning(0x2d48A3957C7246f5630A2CFF2fcBDf737e0177b4, remaining);
            }
        }

    function transact(string memory _message, uint256 _amount) internal{

            require(_amount >= _amountToPay , "You have to pay the right price!");
            payToken.transferTokenToDex(_amount);

            //uint256 payback = (((_startPrice*((_basis/100)**(_personenZaehler)))-(_startPrice*(_basis/100)**(_personenZaehler-1)))/2)+(_startPrice*((_basis/100)**_personenZaehler-1));
            //uint256 payback = ((_startPrice*(_basis/100)**(_personenZaehler)-_startPrice*(_basis/100)**(_personenZaehler-1))/2)+(_startPrice*(_basis/100)**_personenZaehler-1);
            uint256 amountOld = ((_amountToPay*100)/_basis);
            uint256 payback = ((_amountToPay-amountOld)/2)+amountOld;
            uint256 rest = _amountToPay-payback;
            paybackLastOne(payback*(100-_provision)/100);
            paybackAll(rest*(100-_provision)/100);
            uint256 remaining = address(this).balance;
            paybackProvision(remaining);
            //Rechnung Provision Potenz 2: amountToPay-50*0,02+50 + (vorherige)
            coin.safeTransferFrom(coin.ownerOf(coin.getTokenId()),msg.sender, coin.getTokenId());
            addNewOwner(msg.sender, _message);
            newDeadline(block.timestamp + _deadlineLength);
            _amountToPay = ((_amountToPay*_basis)/100); //Theoretisch einfach mal Basis/100 nehmen
    }

    function buyRichCoin(string memory _message, uint256 _amount) nonReentrant external payable {
        if(!_auctionStarted){
            require(block.timestamp >= _auctionStart, "The auction hasn't started yet!");
            _auctionStarted = true;
        }
        if(block.timestamp >= _deadline){
            payable(msg.sender).transfer(msg.value);
            coin.endAuction();
            emit AuctionEnded(true);
            selfdestruct(payable(coin.getOwnerByOrder(1)));
        }else{
            transact(_message, _amount);
        }
    }

    function getPreis() external view returns(uint256){
        return _amountToPay;
    }

    function isStarted() external view returns(bool){
        return _auctionStarted;
    }

    function getAuctionStart() external view returns(uint256){
        return _auctionStart;
    }

    function getDeadlineLength() external view returns(uint256){
        return _deadlineLength;
    }

    function getDeadlineRemaining() external view returns(uint256){
        return _deadline;
    }

    function getStartPrice() external view returns(uint256){
        return _startPrice;
    }

    function getBasis() external view returns(uint256){
        return _basis;
    }

    function getRichCoin() external view returns(address) {
        return address(coin);
    }

}