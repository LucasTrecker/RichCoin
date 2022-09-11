const RichCoin = artifacts.require("RichCoin");

module.exports = function (deployer) {
  deployer.deploy(RichCoin, "TEST", "TST", 1661289812, 30000000, 200, 200, "blab", "blab");
};