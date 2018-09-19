const Debts = artifacts.require('./Debts.sol');

const OxoConfig = artifacts.require('./oxo/OxoConfig.sol');
const Ownable = artifacts.require('./oxo/Ownable.sol');
const GameAction = artifacts.require('./oxo/GameAction.sol');
const Players = artifacts.require('./oxo/Players.sol');
const OxoGame = artifacts.require('./oxo/OxoGame.sol');

module.exports = deployer => {
    deployer.deploy(Debts);

    deployer.deploy(OxoConfig);
    deployer.deploy(Ownable);
    deployer.deploy(Players);
    deployer.link(Players, OxoGame);
    deployer.link(OxoConfig, OxoGame);
    deployer.link(Ownable, OxoGame);
    deployer.deploy(OxoGame);
};
