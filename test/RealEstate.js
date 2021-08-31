const _deploy_contracts = require("../migrations/2_deploy_contracts")

var RealEstate = artifacts.require("./RealEstate.sol")
var RentContract = artifacts.require("./RentContract.sol")

let getAccount = async () => {
    const accounts = await web3.eth.getAccounts()
 }


contract('RealEstate', function(accounts){ 
    it('create a real estate', function(){
        return RealEstate.deployed().then(function(returnedEstate){
            estate = returnedEstate;
            return estate.getOwner()
        }).then(function(returnedOwner){
            assert.equal(returnedOwner, accounts[1], 'checks if the contract was sucesfully deployed with the good owner');
        });
    });
    it('transfert ownership', function(){
        return RealEstate.deployed().then(function(returnedEstate){
            estate = returnedEstate;
            estate.transfert(accounts[1]);
            return estate.getOwner()
        }).then(function(returnedOwner){
            assert.equal(returnedOwner, accounts[1], 'checks if the contract was sucesfully transfered');
        });
    });
})

/*
contract('RealEstate', function(accounts){ 
    it('Make a rent', function(){
        return RealEstate.deployed().then(function(returnedEstate){
            estate = returnedEstate;
            return estate.getRenting()
        }).then(function(rentingAdress){
            assert.equal(rentingAdress, rentingAdress, 'renting');
        });
    });
})
*/

/*
contract('Rent', function(accounts){
    it('TryLessor', function(){
        return RentContract.deployed().then(function(returnedRent){
            renting = returnedRent;
            return renting.getLessor()
        }).then(function(lessor){
            assert.equal(lessor, addr1, 'checks if the contract was deployed with the good lessor');
        });
    });
    it('TryLessee', function(){
        return RentContract.deployed().then(function(returnedRent){
            renting = returnedRent;
            return renting.getLessee()
        }).then(function(lessee){
            assert.equal(lessee, addr2, 'checks if the contract was deployed with the good lessee');
        });
    });
})
*/
