const Reverter = require('./helpers/reverter');
const Asserts = require('./helpers/asserts');
const OXO = artifacts.require('./OxoGame.sol');

contract('OXO', function (accounts) {
    const reverter = new Reverter(web3);
    afterEach('revert', reverter.revert);

    const asserts = Asserts(assert);
    const OWNER = accounts[0];
    let oxo;
    let defaultBet = 1000;
    let defaultGameId = 0;

    before('setup', () => {
        return OXO.deployed()
            .then(instance => oxo = instance)
            .then(reverter.snapshot);
    });


    it('should allow to create the game ', async () => {

        const player = accounts[1];
        let gameId = await oxo.createGame.call({from: player, value: defaultBet}).valueOf();
        assert.equal(gameId, 0);
    });

    it('should deny to create the game with incorrect bet', async () => {

        const player = accounts[1];
        var res = await asserts.throws(oxo.createGame({from: player, value: 0}));

        const value = '0xffffffsffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        var res = await asserts.throws(oxo.createGame({from: player, value: value}));


        await asserts.throws(oxo.createGame({from: player, value: value / 2}));
    });

    it('should emit event about game creation ', async () => {

        const player = accounts[1];
        var result = await oxo.createGame({from: player, value: defaultBet});
        assert.equal(result.logs[0].event, 'GameCreated');
        assert.equal(result.logs[0].args.gameId.valueOf(), defaultGameId);
        assert.equal(result.logs[0].args.bet.valueOf(), defaultBet);
    });

    it('should allow user to join the game', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        let result = await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        assert.equal(result.logs[0].event, 'GameStarted');
        assert.equal(result.logs[0].args.gameId.valueOf(), defaultGameId);
        assert.equal(result.logs[0].args.player.valueOf(), player2);
    });

    it('should deny user to join the game if there are 2 players already', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        const player3 = accounts[3];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await asserts.throws(oxo.joinGame(defaultGameId, {from: player3, value: defaultBet}));
    });


    it('should deny user to join the game if he bet different value', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await asserts.throws(oxo.joinGame(defaultGameId, {from: player2, value: defaultBet + 1}));
    });


    it('should deny user to join the game if its not yet created', async () => {

        const player2 = accounts[2];
        await asserts.throws(oxo.joinGame(defaultGameId, {from: player2, value: defaultBet}));
    });


    it('should allow user to make move', async () => {

        let moveIndex = 1;
        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        let result = await oxo.move(defaultGameId, moveIndex, {from: player1});

        assert.equal(result.logs[0].event, 'UserMadeMove');
        assert.equal(result.logs[0].args.index.valueOf(), moveIndex);
        assert.equal(result.logs[0].args.player.valueOf(), player1);
        assert.equal(result.logs.length, 1);
    });

    it('should deny user to make two consecutive moves', async () => {

        let moveIndex = 1;
        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await oxo.move(defaultGameId, moveIndex, {from: player1});
        await asserts.throws(oxo.move(defaultGameId, moveIndex, {from: player1}));
    });


    it('should deny user to make move if there are not enough players', async () => {

        let moveIndex = 1;
        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        // await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await asserts.throws(oxo.move(defaultGameId, moveIndex, {from: player1}));
    });


    it('should deny user to make move if move index not valid', async () => {

        let moveIndex = 1;
        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await asserts.throws(oxo.move(defaultGameId, moveIndex - 100, {from: player1}));
    });


    it('should allow only to game creator make first move', async () => {

        let moveIndex = 1;
        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await asserts.throws(oxo.move(defaultGameId, moveIndex, {from: player2}));
    });


    it('should deny user to make previously made move ', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await oxo.move(defaultGameId, 1, {from: player1});
        await oxo.move(defaultGameId, 2, {from: player2});
        await asserts.throws(oxo.move(defaultGameId, 2, {from: player1}));
        await asserts.throws(oxo.move(defaultGameId, 1, {from: player1}));
    });


    it('should allow to make move only players joined to the game', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        const player3 = accounts[3];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await oxo.move(defaultGameId, 1, {from: player1});
        await oxo.move(defaultGameId, 2, {from: player2});
        await asserts.throws(oxo.move(defaultGameId, 3, {from: player3}));
    });

    it('should allow player1 to win', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await oxo.move(defaultGameId, 1, {from: player1});
        await oxo.move(defaultGameId, 4, {from: player2});
        await oxo.move(defaultGameId, 2, {from: player1});
        await oxo.move(defaultGameId, 5, {from: player2});
        let result = await oxo.move(defaultGameId, 3, {from: player1});


        assert.equal(result.logs[1].event, 'GameWon');
        assert.equal(result.logs[1].args.gameId.valueOf(), defaultGameId);
        assert.equal(result.logs[1].args.winner.valueOf(), player1);


        assert.equal(result.logs[2].event, 'MoneyTransferred');
        assert.equal(result.logs[2].args.gameId.valueOf(), defaultGameId);
        assert.equal(result.logs[2].args.player.valueOf(), player1);
        assert.equal(result.logs[2].args.amount.valueOf(),  userPayout(defaultBet)* 2);
    });

    it('should allow players to cancel game', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        var result = await oxo.cancelGame.call(defaultGameId, {from: player1}).valueOf();
        assert.equal(result, false);
        result = await oxo.cancelGame(defaultGameId, {from: player1});
        result = await oxo.cancelGame(defaultGameId, {from: player2});

        assert.equal(result.logs[0].event, 'MoneyTransferred');
        assert.equal(result.logs[0].args.gameId.valueOf(), defaultGameId);
        assert.equal(result.logs[0].args.player.valueOf(), player1);
        assert.equal(result.logs[0].args.amount.valueOf(), userPayout(defaultBet));

        assert.equal(result.logs[1].event, 'MoneyTransferred');
        assert.equal(result.logs[1].args.gameId.valueOf(), defaultGameId);
        assert.equal(result.logs[1].args.player.valueOf(), player2);
        assert.equal(result.logs[1].args.amount.valueOf(), userPayout(defaultBet));

        assert.equal(result.logs[2].event, 'GameCanceled');
        assert.equal(result.logs[2].args.gameId.valueOf(), defaultGameId);
    });


    it('should deny to one player cancel game twice', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        result = await oxo.cancelGame(defaultGameId, {from: player1});
        await asserts.throws(oxo.cancelGame(defaultGameId, {from: player1}))
    });

    it('should deny player to cancel game without joining', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        const player3 = accounts[3];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await asserts.throws(oxo.cancelGame(defaultGameId, {from: player3}))
    });


    it('should allow to creator cancel the game if there are no any other players', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        var result = await oxo.cancelGame(0, {from: player1});

        assert.equal(result.logs[0].event, 'MoneyTransferred');
        assert.equal(result.logs[0].args.gameId.valueOf(), defaultGameId);
        assert.equal(result.logs[0].args.player.valueOf(), player1);
        assert.equal(result.logs[0].args.amount.valueOf(), userPayout(defaultBet));

        assert.equal(result.logs[1].event, 'GameCanceled');
        assert.equal(result.logs[1].args.gameId.valueOf(), defaultGameId);
    });

    it('should deny to cancel finished game', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await oxo.move(defaultGameId, 1, {from: player1});
        await oxo.move(defaultGameId, 4, {from: player2});
        await oxo.move(defaultGameId, 2, {from: player1});
        await oxo.move(defaultGameId, 5, {from: player2});
        let result = await oxo.move(defaultGameId, 3, {from: player1});

        await asserts.throws(oxo.cancelGame(defaultGameId, {from: player1}))
        await asserts.throws(oxo.cancelGame(defaultGameId, {from: player2}))
    });

    it('should cause game to draw', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await oxo.move(defaultGameId, 1, {from: player1});
        await oxo.move(defaultGameId, 5, {from: player2});
        await oxo.move(defaultGameId, 3, {from: player1});
        await oxo.move(defaultGameId, 2, {from: player2});
        await oxo.move(defaultGameId, 8, {from: player1});
        await oxo.move(defaultGameId, 9, {from: player2});
        await oxo.move(defaultGameId, 6, {from: player1});
        await oxo.move(defaultGameId, 4, {from: player2});
        let result = await oxo.move(defaultGameId, 7, {from: player1});

        assert.equal(result.logs[1].event, 'Draw');
        assert.equal(result.logs[1].args.gameId.valueOf(), defaultGameId);


        assert.equal(result.logs[2].event, 'MoneyTransferred');
        assert.equal(result.logs[2].args.gameId.valueOf(), defaultGameId);
        assert.equal(result.logs[2].args.player.valueOf(), player1);
        assert.equal(result.logs[2].args.amount.valueOf(),  userPayout(defaultBet));

        assert.equal(result.logs[3].event, 'MoneyTransferred');
        assert.equal(result.logs[3].args.gameId.valueOf(), defaultGameId);
        assert.equal(result.logs[3].args.player.valueOf(), player2);
        assert.equal(result.logs[3].args.amount.valueOf(),  userPayout(defaultBet));
    });

    it('should allow owner to withdraw money', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await oxo.cancelGame(defaultGameId, {from: player1});
        await oxo.cancelGame(defaultGameId, {from: player2});
        var result = await oxo.withdrawBalance(100, {from: OWNER});

        assert.equal(result.logs[0].event, 'MoneyWithdrawn');
        assert.equal(result.logs[0].args.addr.valueOf(), OWNER);
        assert.equal(result.logs[0].args.amount.valueOf(), 100);
    });

    it('should deny not owner to withdraw money', async () => {

        const player1 = accounts[1];
        const player2 = accounts[2];
        await oxo.createGame({from: player1, value: defaultBet});
        await oxo.joinGame(defaultGameId, {from: player2, value: defaultBet});
        await oxo.cancelGame(defaultGameId, {from: player1});
        await oxo.cancelGame(defaultGameId, {from: player2});
        await asserts.throws(oxo.withdrawBalance(100, {from: player1}));
    });





    function l(text) {
        console.log(text);
    }

    function userPayout(bet){
        return bet - (bet / 100 * 5);
    }

})