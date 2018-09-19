pragma solidity 0.4.19;

contract GameEntity {
    enum GameStatus {CREATED, STARTED, FINISHED}
    struct Game {
        GameStatus status;
        uint bet;
        uint gameId;

        mapping(address => mapping(uint8 => bool)) moves;
        mapping(address => uint8) moveCount;
        mapping(uint8 => bool) allMoves;
        uint8 allMoveCount;

        uint8 playerCount;
        uint8 cancelerCount;
        mapping(address => bool) players;
        address[] playerArr;
        mapping(address => bool) cancelers;


        address winner;
        address lastMove;// helps define whom should move next
    }

    Game[] internal games;

    function createAndGetGame() internal returns  (Game storage){
        games.length += 1;
        return games[games.length -1];
    }
}
