
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IRichCoin.sol";
import "./openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IPayToken.sol";
import "./IDex.sol";

contract DEX is ERC721Holder, ReentrancyGuard, IDex{
    IPayToken private payToken;
    IRichCoin private coin;
    uint256 private _basis;
    uint256 private _deadline;
    uint256 private _auctionStart;
    uint256 private _created;
    bool private _auctionStarted = false;
    uint256 private _deadlineLength;
    uint256 private _startPrice; //Startpreis festlegen, müsste unten multipliziert werden
    uint256 private _provision = 2;
    uint256 _personenZaehler = 1;
    event NewOwner(address indexed _owner, uint256 _counter, uint256 _pricePaid, string _message); //Eventuell noch Message hinzufügen, gehasht oder nicht gehasht
    event NewDeadline(uint256 _deadline);
    event AuctionEnded(bool _ended);
    uint256 private _amountToPay;
    uint256 private _amountOld;

    constructor(address richCoinAddress, uint256 auctionStart, uint256 deadlineLength, uint256 startPrice, uint256 basis) {
        require(basis > 100, "Base is too low");
        require((startPrice*basis)/100 > startPrice, "Invalid price increase");
        require(deadlineLength < 31622400, "Deadline length is too big");
        //require(auctionStart > block.timestamp, "Auction start is not in the future"); //Wobei vielleicht Auktion direkt beginnen
        //Validierung ob Prozentsatz valid
        //Über Backend checken ob bytecode valid oder hier rüber mit web3
        _created = block.timestamp;
        _auctionStart = auctionStart;
        _deadlineLength = deadlineLength;
        _startPrice = startPrice;
        _basis = basis;
        _amountOld = startPrice;
        _amountToPay = ((_amountOld*_basis)/100);
        coin = IRichCoin(richCoinAddress);
        payToken = IPayToken(0xdD24c4B897105D90b040230eE18172D059e57f99); //Proxy?
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
                    amountToSend += amountToSend;
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
            //Dürfen Contracts kaufen?
            require(_amount >= _amountToPay , "You have to pay the right price!");
            payToken.transferTokenToDex(_amountToPay, msg.sender);

            //uint256 payback = (((_startPrice*((_basis/100)**(_personenZaehler)))-(_startPrice*(_basis/100)**(_personenZaehler-1)))/2)+(_startPrice*((_basis/100)**_personenZaehler-1));
            //uint256 payback = ((_startPrice*(_basis/100)**(_personenZaehler)-_startPrice*(_basis/100)**(_personenZaehler-1))/2)+(_startPrice*(_basis/100)**_personenZaehler-1);
            uint256 payback = ((_amountToPay-_amountOld)/2)+_amountOld;
            uint256 rest = _amountToPay-payback;
            paybackLastOne(payback*(100-_provision)/100);
            paybackAll(rest*(100-_provision)/100);
            uint256 remaining = address(this).balance;
            paybackProvision(remaining);
            //Rechnung Provision Potenz 2: amountToPay-50*0,02+50 + (vorherige)

            //safeTransfer nach oben? (Weiterer Schutz gegen reentrancy weil man denselben token nicht zwei mal an sich verschicken kann)
            //Wobei Reentrancy eh nicht so viel bringt weil die funds ja der Angreifer bezahlen müsste, stacken in NewOwner auch nicht möglich
            //da dies danach geschieht
            coin.safeTransferFrom(coin.ownerOf(coin.getTokenId()),msg.sender, coin.getTokenId());
            addNewOwner(msg.sender, _message);
            newDeadline(block.timestamp + _deadlineLength);
            _amountOld = _amountToPay;
            _amountToPay = ((_amountOld*_basis)/100); //Theoretisch einfach mal Basis/100 nehmen
    }

    function buyRichCoin(string memory _message, uint256 _amount) nonReentrant external {
        if(!_auctionStarted){
            require(block.timestamp >= _auctionStart, "The auction hasn't started yet!");
            _auctionStarted = true;
        }
        if(block.timestamp >= _deadline){
            //Token die übrig noch übertragen
            coin.endAuction();
            emit AuctionEnded(true);
            selfdestruct(payable(coin.getOwnerByOrder(1))); //Ändern wer es bekommt
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

    function getRichCoin() external view override returns(address) {
        return address(coin);
    }

    function getCreated() external view override returns(uint256){
        return _created;
    }

}