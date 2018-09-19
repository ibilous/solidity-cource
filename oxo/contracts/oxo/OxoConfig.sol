pragma solidity 0.4.19;

contract OxoConfig {

    //    |1|2|3|
    //    |4|5|6|
    //    |7|8|9|
    uint8[3][] internal winCombinations = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7]
    ];

    uint8 private feePercentage = 5;
    uint internal contractBalance;
    uint256 constant private UINT256_MAX = ~uint256(0);

    uint8 maxFieldNumber = 9;
    uint8 maxPlayerCount = 2;
    uint maxBet = (UINT256_MAX / 2) - 1;

    // contract need to earn something on the game. At least 5%
    function calculateUserPayout(uint amount) view internal returns(uint){
        uint num = amount / 100 * feePercentage;
        return amount - num;
    }

    function addToBalance(uint amount) internal {
        if (contractBalance + amount < UINT256_MAX){ // TODO: need to create new balance value and push it to an array;
            contractBalance+=amount;
        }
    }



}
