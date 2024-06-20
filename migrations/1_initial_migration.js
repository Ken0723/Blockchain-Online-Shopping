//const MyToken = artifacts.require("MyToken");
const Shopping = artifacts.require("Shopping");

module.exports = (deployer) => {
  //deployer.deploy(MyToken, "MyToken", "MYT", 100000);
  deployer.deploy(Shopping, "MyToken", "TT", 100000);
};
