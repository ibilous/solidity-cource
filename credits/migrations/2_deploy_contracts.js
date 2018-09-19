const Debts = artifacts.require('./Debts.sol');
const SafeMath = artifacts.require('./credits/SafeMath.sol');
const Ownable = artifacts.require('./credits/Ownable.sol');
const Credits = artifacts.require('./credits/Credits.sol');

module.exports = deployer => {
    deployer.deploy(Debts);
    deployer.deploy(SafeMath);
    deployer.deploy(Ownable);
    deployer.link(SafeMath, Credits);
    deployer.link(Ownable, Credits);
    deployer.deploy(Credits);

};
