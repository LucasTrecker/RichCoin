const ICO = artifacts.require("ICO");

module.exports = function (deployer) {
  deployer.deploy(ICO, "0xe869165E993FD8e1B28B50ead4791e862942cB53");
};