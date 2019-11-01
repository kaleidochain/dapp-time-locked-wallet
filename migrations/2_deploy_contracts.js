var TimeLockedWalletFactory = artifacts.require("TimeLockedWalletFactory");
var TimeLockedPool = artifacts.require("TimeLockedPool");

module.exports = function(deployer) {
  deployer.deploy(TimeLockedWalletFactory);
  deployer.deploy(TimeLockedPool);
};
