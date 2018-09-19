const Reverter = require('./helpers/reverter');
const Asserts = require('./helpers/asserts');
const Credits = artifacts.require('./credits/Credits.sol');

contract('Credits', function (accounts) {
    const reverter = new Reverter(web3);
    afterEach('revert', reverter.revert);

    const asserts = Asserts(assert);
    const OWNER = accounts[0];
    let credits;

    before('setup', () => {
        return Credits.deployed()
            .then(instance => credits = instance)
            .then(reverter.snapshot);
    });

    it('should allow to ask for credits', async () => {
        const borrower = accounts[3];
        const amount = 1000;
        let res = await credits.creditRequest(amount, {from: borrower});
        assert.equal(await credits.creditRequests(borrower), amount);

    });

    it('should fail on overflow while crediting', async () => {
        const borrower = accounts[3];
        const amount = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        await credits.creditRequest(amount, {from: borrower})
        await asserts.throws(credits.creditRequest(1, {from: borrower}))
    });

    it('should emit event after credit request', async () => {
        const borrower = accounts[3];
        const amount = 1000;
        let result = await credits.creditRequest(amount, {from: borrower});
        assert.equal(result.logs[0].event, 'CreditRequested');
        assert.equal(result.logs[0].args.requestor, borrower);
        assert.equal(result.logs[0].args.amount.valueOf(), amount);
    });

    it('should deny zero credit request', async () => {
        const borrower = accounts[3];
        const amount = 0;
        await asserts.throws(credits.creditRequest(amount, {from: borrower}))
    });

    it('should not allow owner to request credits', async () => {
        const value = 1000;
        await asserts.throws(credits.creditRequest(value, {from: OWNER}))
    });

    it('owner can approve credit request', async () => {
        const borrower = accounts[3];
        const amount = 1000;
        let res = await credits.creditRequest(amount, {from: borrower});
        await  credits.approveCreditTransaction(borrower, amount, {from: OWNER});
        assert.equal(await credits.creditRequests(borrower), 0);
        assert.equal(await credits.credits(borrower), amount);

    });

    it('owner cannot approve more than was credited', async () => {
        const borrower = accounts[3];
        const amount = 1000;
        let res = await credits.creditRequest(amount, {from: borrower});
        await  asserts.throws(credits.approveCreditTransaction(borrower, amount+1, {from: OWNER}));
        assert.equal(await credits.creditRequests(borrower), amount);
        assert.equal(await credits.credits(borrower), 0);

    });

    it('should emit event after credit approve', async () => {
        const borrower = accounts[3];
        const amount = 1000;
        await credits.creditRequest(amount, {from: borrower});
        let result = await  credits.approveCreditTransaction(borrower, amount, {from: OWNER});
        assert.equal(result.logs[0].event, 'CreditTransactionApproved');
    });

    it('only owner can approve request', async () => {
        const value = 1000;
        const borrower = accounts[3];
        const alien = accounts[2];
        await credits.creditRequest(value, {from: borrower});
        await asserts.throws(credits.approveCreditTransaction(value, {from: alien}))
    });

    it('owner can approve not all credit request', async () => {
        const borrower = accounts[3];
        const amount = 1000;
        let res = await credits.creditRequest(amount, {from: borrower});
        res = await credits.creditRequest(amount, {from: borrower});
        await  credits.approveCreditTransaction(borrower, amount, {from: OWNER});
        assert.equal(await credits.creditRequests(borrower), amount);
        assert.equal(await credits.credits(borrower), amount);

    });

    it('borrower can return funds', async () => {
        const borrower = accounts[3];
        const amount = 1000;
        await credits.creditRequest(amount, {from: borrower});
        await  credits.approveCreditTransaction(borrower, amount, {from: OWNER});
        await  credits.returnFunds(borrower, amount, {from: OWNER});

        assert.equal(await credits.credits(borrower), 0);

    });


    it('only owner can return funds', async () => {
        const borrower = accounts[3];
        const alien = accounts[2];
        const amount = 1000;
        await credits.creditRequest(amount, {from: borrower});
        await  credits.approveCreditTransaction(borrower, amount, {from: OWNER});
        await  asserts.throws(credits.returnFunds(borrower, amount, {from: alien}));
        assert.equal(await credits.credits(borrower), amount);

    });

    it('owner cannot return more funds than was borrowed', async () => {
        const borrower = accounts[3];
        const amount = 1000;
        await credits.creditRequest(amount, {from: borrower});
        await  credits.approveCreditTransaction(borrower, amount, {from: OWNER});
        await  asserts.throws(credits.returnFunds(borrower, amount+1, {from: OWNER}));

        assert.equal(await credits.credits(borrower), amount);

    });

    it('should emit event after successful funds return ', async () => {
        const borrower = accounts[3];
        const amount = 1000;
        await credits.creditRequest(amount, {from: borrower});
        await  credits.approveCreditTransaction(borrower, amount, {from: OWNER});
        let result = await  credits.returnFunds(borrower, amount, {from: OWNER});
        assert.equal(result.logs[0].event, 'FundsReturned');
        assert.equal(result.logs[0].args.amount.valueOf(), amount);
    });

    it('owner can return half funds ', async () => {
        const borrower = accounts[3];
        const amount = 1000;
        await credits.creditRequest(amount*2, {from: borrower});
        await  credits.approveCreditTransaction(borrower, amount*2, {from: OWNER});
        assert.equal(await credits.credits(borrower), amount*2);
        await  credits.returnFunds(borrower, amount, {from: OWNER});
        assert.equal(await credits.credits(borrower), amount);

    })



});
