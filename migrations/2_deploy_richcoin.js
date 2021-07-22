const RichCoin = artifacts.require("RichCoin");

module.exports = function (deployer) {
  deployer.deploy(RichCoin);
};