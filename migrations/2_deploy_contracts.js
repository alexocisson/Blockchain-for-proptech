const RentContract = artifacts.require("./RentContract.sol");
const EstateFactory = artifacts.require("./EstateFactory.sol");

//accounts = web3.eth.getAccounts();

//let accounts;

/*async () => {
  accounts = await web3.eth.getAccounts();
  console.log(accounts[0]);
}

console.log("yo??");
console.log(accounts[0]);


module.exports = function (deployer) {
  deployer.deploy(RealEstate, "0x8D241a3aa3e4eD977009578BcD4eD716bE917C49");
  deployer.deploy(RentContract, "0x8D241a3aa3e4eD977009578BcD4eD716bE917C49", "0x6F5Cc3280Cc34BB2eB046e8E7626123275920552");
};*/

let contractAdress;
let ownerOwner;

/*
module.exports = function(deployer, network, accounts) {
  deployer.then(function() {
    ownerOwner = accounts[0];
    console.log('Owner owner:', ownerOwner);
    return RealEstate.new(ownerOwner, { from: ownerOwner });
  }).then(instance => {
    contractAdress = instance;
    console.log('Contract address:', contractAdress.address);
  });
};
*/
 /*
module.exports = function(deployer, network, accounts) {
  deployer.then(function() {
    ownerOwner = accounts[0];
    console.log('Owner owner:', ownerOwner);
    return EstateFactory.new(ownerOwner, { from: ownerOwner });
  }).then(instance => {
    contractAdress = instance;
    console.log('Contract address:', contractAdress.address);
  });
};
*/

module.exports = function(deployer, network, accounts) {
    ownerOwner = accounts[0];
    console.log('Owner owner:', ownerOwner);
    deployer.deploy(EstateFactory, ownerOwner, { from: ownerOwner }
      ).then(instance => {
    contractAdress = instance;
    console.log('Contract address:', contractAdress.address);
  });
};
