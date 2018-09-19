pragma solidity 0.4.19;

import "./GameEntity.sol";

contract Players is GameEntity {

    function addPlayer(Game storage game, address player) internal {
        game.players[player] = true;
        game.playerArr.push(player);
        game.playerCount += 1;
    }

    function addCanceler(Game storage game, address player) internal {
        game.cancelerCount += 1;
        game.cancelers[player] = true;
    }

    function isPlayer(Game storage game, address player) internal view returns(bool){
        return game.players[player];
    }

    function isCanceler(Game storage game, address player) internal view returns(bool){
        return game.cancelers[player];
    }

    function player(Game memory game, uint8 index) internal pure returns(address){
        return index < game.playerArr.length ? game.playerArr[index] : address(0);
    }
}
