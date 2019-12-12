var TimeLockedWalletFactory = artifacts.require("TimeLockedWalletFactory");
var TimeLockedPool = artifacts.require("TimeLockedPool");

module.exports = function(deployer,network,accounts) {
  var creator = accounts[0];
  let now = Math.round(new Date() / 1000);
  //deployer.deploy(TimeLockedWalletFactory);
  deployer.deploy(TimeLockedPool,creator,creator,creator,now+20,now+100,10);

};
