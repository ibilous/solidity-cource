pragma solidity 0.4.19;

import "./Ownable.sol";
import "./SafeMath.sol";

contract Credits is Ownable {
    
    using SafeMath for uint256;

    mapping(address => uint) public credits;
    mapping(address => uint) public creditRequests;

    event CreditRequested(address requestor, uint amount);
    event CreditTransactionApproved(address requestor, uint amount);
    event FundsReturned(address requestor, uint amount);
    
   function creditRequest(uint _amount) onlyNotOwner public returns(bool result) {
        require(_amount > 0);
        creditRequests[msg.sender] = SafeMath.add(_amount, creditRequests[msg.sender]);
        CreditRequested(msg.sender, _amount);
        return true;
    }
    
    function reviewCreditRequest(address requestor) view public returns (uint){
        return creditRequests[requestor];
    }
    
    function approveCreditTransaction(address addr, uint approveAmount) onlyOwner public returns(bool){
        uint askedAmount = creditRequests[addr];
        require(approveAmount > 0 && approveAmount <= askedAmount);
        creditRequests[addr] = SafeMath.sub(creditRequests[addr], approveAmount);
        credits[addr] = SafeMath.add(credits[addr], approveAmount);
        CreditTransactionApproved(addr, approveAmount);
        return true;
    }
    //===============================================================================
    
    
    function returnFunds(address addr, uint amount) onlyOwner public returns(bool){
        uint currentCreditAmount = credits[addr];
        require(currentCreditAmount >= amount);
        credits[addr] = SafeMath.sub(credits[addr], amount);
        FundsReturned(addr, amount);
        return true;
    }
    
    function reviewCreditAmount(address requestor) view public returns (uint){
        return credits[requestor];
    }
}

// Протокол займа:
// 1. Вы встречаетесь с человеком, чтобы дать ему займ;
// 2. Он отправляет транзакцию на ваш контракт и указывает сумму займа;
// 3. Вы проверяете, что в контракте действительно появилась такая сумма;
// 4. Вы передаете деньги.


// 1. Вы встречаетесь с человеком, который хочет вернуть займ;
// 2. Вы отправляете транзакцию на ваш контракт и указываете сумму возврата;
// 3. Он проверяет, что в контракте действительно сумма его займа уменьшилась на
// правильную сумму;
// 4. Он передает вам деньги.
