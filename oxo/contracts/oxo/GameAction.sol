pragma solidity 0.4.19;

import "./GameEntity.sol";

contract GameAction is GameEntity {


    function addMove(Game  storage game, uint8 move, address addr) internal {
        game.moves[addr][move] = true;
        game.moveCount[addr] += 1;
        game.allMoves[move] = true;
        game.allMoveCount += 1;

        game.lastMove = addr;
    }

    function isMoved(Game  storage game, uint8 move) internal view returns (bool){
        return game.allMoves[move];
    }

}
