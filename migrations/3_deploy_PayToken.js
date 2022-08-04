const PayToken = artifacts.require("PayToken");

module.exports = function (deployer) {
  deployer.deploy(PayToken);
};