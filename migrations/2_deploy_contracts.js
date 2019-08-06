var TimeLockedWalletFactory = artifacts.require("ManageableTimeLockedWalletFactory");

module.exports = function(deployer) {
  deployer.deploy(TimeLockedWalletFactory);
};
