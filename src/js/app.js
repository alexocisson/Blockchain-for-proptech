App = {
    web3Provider: null,
    contracts: {},

    factoryRef: null,

    account: '0x0',
    factoryAddress: '0x0',
    ownerAddress: '0x0',
    ownerEstatesNumber: 0,
    estateAddress: '0x0',
    rentAddress: '0x0',

    //called a the start of the app
    init: function () {
        console.log("App initialized...")
        return App.initWeb3();
    },

    //init the web3 informations and connect to metamask
    initWeb3: function () {
    if(typeof window !== 'undefined' && typeof ethereum !== 'undefined'){
        //getting Permission to access. This is for when the user has new MetaMask
        ethereum.enable();
        App.web3Provider = ethereum;
        web3 = new Web3(ethereum);
      }
      // Acccounts always exposed. This is those who have old version of MetaMask
      else if (typeof window !== 'undefined' && typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
      
      } 
      // Specify default instance if no web3 instance provided
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
      
      }
      //reload page when account changed
      window.ethereum.on('accountsChanged', function (accounts) {
        App.initContracts();
      });
      return App.initContracts();
    },

    //init the contract and saves them into variables
    initContracts: function () {
        //get RentContract contract with truffle
        $.getJSON("RentContract.json", function (RentContract) {
            App.contracts.RentContract = TruffleContract(RentContract);
            App.contracts.RentContract.setProvider(App.web3Provider);
        }).done(function () {
            //get RealEstate contract with truffle
            $.getJSON("RealEstate.json", function (RealEstate) {
                App.contracts.RealEstate = TruffleContract(RealEstate);
                App.contracts.RealEstate.setProvider(App.web3Provider);
            }).done(function () {
                //get EstateFactory contract with truffle
                $.getJSON("EstateFactory.json", function (EstateFactory) {
                    App.contracts.EstateFactory = TruffleContract(EstateFactory);
                    App.contracts.EstateFactory.setProvider(App.web3Provider);
                    App.contracts.EstateFactory.deployed().then(function (EstateFactory) {
                        console.log("Estate Factory Address:", EstateFactory.address);
                        App.factoryAddress = EstateFactory.address;
                    }).then(function () {
                        //loads the current address from metamask
                        web3.eth.getCoinbase(function (err, account) {
                            if (err === null) {
                                App.account = account;
                                $('#accountAddress').html(account);
                                web3.eth.defaultAccount=account;
                            }
                        })
                        return App.initManagePage();
                    });
                });
            });
        });
            
    },
    
    //load the page to manage real estates
    initManagePage: async function () {
        document.getElementById('createEstateButton').className = "btn btn-primary btn-sm";
        document.getElementById('manageEstateButton').className = "btn btn-secondary btn-sm";
        document.getElementById('changeReferenceButton').className = "btn btn-primary btn-sm";

        $('#manageEstates').show();
        $('#createEstates').hide();
        $('#changeReference').hide();

        $('#estates').hide();
        document.getElementById("main-contract-address").innerHTML = App.factoryAddress;        
    },

    //init the page to create real estates
    initCreatePage: function () {
        document.getElementById('createEstateButton').className = "btn btn-secondary btn-sm";
        document.getElementById('manageEstateButton').className = "btn btn-primary btn-sm";
        document.getElementById('changeReferenceButton').className = "btn btn-primary btn-sm";
        
        $('#manageEstates').hide();
        $('#createEstates').show();
        $('#changeReference').hide();

        //check if the adress of the user has the right to issue real estates
        App.contracts.EstateFactory.at(App.factoryAddress).then(async function (instance) {
            estateFactoryInstance = instance;
            return estateFactoryInstance.getOwner();
        }).then( async function (ownerEstate){
            //shows the form to create estates for the owner of the contract
            if (ownerEstate != App.account)
            {
                $('#isTheowner').hide();
                $('#notTheowner').show();
            }
            else{
                $('#isTheowner').show();
                $('#notTheowner').hide();
            }
        });

    },

    //init the page to change the factory contract
    initChangePage: function () {
        document.getElementById('createEstateButton').className = "btn btn-primary btn-sm";
        document.getElementById('manageEstateButton').className = "btn btn-primary btn-sm";
        document.getElementById('changeReferenceButton').className = "btn btn-secondary btn-sm";

        $('#manageEstates').hide();
        $('#createEstates').hide();
        $('#changeReference').show();
    },

    //loads to estates of a given adress to manage the properties
    loadEstates: async function () {
        $('#showRentingInfo').hide();
        owner = $('#ownerAdress').val();

        var nbOfEstate = 0;
        let estateList = new Array();


        App.contracts.EstateFactory.at(App.factoryAddress).then(async function (instance) {
            estateFactoryInstance = instance;
            return estateFactoryInstance.getNumberOfEstates(owner);
        }).then( async function (nbEstate){

            console.log("Number of estates: ", nbEstate.toString());
            nbOfEstate = nbEstate;
            selectEstate = document.getElementById('estateAdresses');
            console.log(selectEstate);
            selectEstate.onchange = function(){
                selectedEstate = selectEstate.value;
                App.showEstateInfos();
            }

            while (selectEstate.length > 0) {
                selectEstate.remove(selectEstate.length-1);
            }
 

            for(var i=0;i<nbEstate;i++){

                let thisEstate = await estateFactoryInstance.getEstateAtNb(owner, i);
                if(i==0)
                {
                    selectedEstate = thisEstate;
                    App.showEstateInfos();
                }

                App.contracts.RealEstate.at(thisEstate).then(async function (instance) {
                    return instance.getName();
                }).then( async function(name){
                    estateList.push(thisEstate);

                    var opt = document.createElement('option');
                    opt.value = thisEstate;
                    opt.innerHTML = web3.toAscii(name);
                    selectEstate.appendChild(opt);
                });
            }

            
            if(nbEstate > 0)
            {
                $('#estates').show();
                $('#rentEstateStatus').show();
                $('#noEstates').hide();
            }
            else
            {
                $('#estates').hide();
                $('#rentEstateStatus').hide();
                $('#noEstates').show();
            } 

  
        }
        );
    },

    //loads to estates of a given adress to manage the properties
    createEstate: async function () {
        var owner = $('#ownerNewEstateAdress').val();
        var name = $('#nameNewEstate').val();

        let estateFactoryInstance;

        App.contracts.EstateFactory.at(App.factoryAddress).then(async function (instance) {
            estateFactoryInstance = instance;
            await estateFactoryInstance.createEstate(owner, name);
            alert("Estate created!");
        });
    },

    //show the selected estate infos, depends of the address of the caller, the owner of the estate and the rent status
    showEstateInfos: async function () {

        $('#createRentContract').hide();
        $('#showRentingInfo').hide();
        $('#signRenting').hide();
        $('#askRent').hide();
        $('#payRenting').hide();
        $('#showRentingInfoPrivate').hide();
        $('#transfertEstate').hide();
        $('#removeRent').hide();
        $('#stopRent').hide();

        var estateOwner;
        
        App.contracts.RealEstate.at(selectedEstate).then(async function (instance) {
            estateOwner = await instance.getOwner();
            
            return instance.getRenting();
        }).then( async function (renting){
            
            if(renting=="0x0000000000000000000000000000000000000000")
            {

                $('#isRent').html("This estate is not for rent");
                if (App.account.toLowerCase() == estateOwner.toLowerCase())
                {
                    $('#transfertEstate').show();
                }
                if (estateOwner == App.account.toLowerCase())
                {
                    $('#createRentContract').show();
                }
            }
            else
            {
                $('#isRent').html("This estate is for rent");
                $('#showRentingInfo').show();
                App.contracts.RentContract.at(renting).then(async function (instance) {
                    var isRenting = await instance.getIsRenting();
                    var monthlyPrice = await instance.getPrice();
                    var downPayment = await instance.getDownPayment();
                    var lessor = await instance.getLessor();
                    var lessee = await instance.getLessee();
                    var storedMoney = await instance.getStoredMoney();
                    var monthNotClaimed = await instance.getMonthNotClaimed();
                    var moneyNotClaimedValue = monthNotClaimed*monthlyPrice;

                    $('#isRentedLabel').html(isRenting.toString());
                    $('#monthlyPriceLabel').html(monthlyPrice.toString());
                    $('#downPaymentLabel').html(downPayment.toString());

                    console.log(typeof isRenting);

                    if (owner.toLowerCase() == App.account.toLowerCase() && isRenting)
                    {
                        $('#askRent').show();
                        $('#showRentingInfoPrivate').show();
                        $('#moneyStockedLabel').html(storedMoney.toString());
                        $('#monthNotClaimedLabel').html(monthNotClaimed.toString());
                        $('#moneyNotClaimedValueLabel').html(moneyNotClaimedValue.toString());
                        $('#stopRent').show();
                        
                    }
                    if (owner.toLowerCase() != App.account.toLowerCase() && !isRenting)
                    {
                        $('#signRenting').show();
                    }
                    if (isRenting && lessee.toLowerCase() == App.account.toLowerCase())
                    {
                        $('#payRenting').show();
                        $('#showRentingInfoPrivate').show();
                        $('#moneyStockedLabel').html(storedMoney.toString());
                        $('#monthNotClaimedLabel').html(monthNotClaimed.toString());
                        $('#moneyNotClaimedValueLabel').html(moneyNotClaimedValue.toString());
                        $('#stopRent').show();
                    }
                    if (!isRenting && App.account.toLowerCase() == estateOwner.toLowerCase())
                    {
                        $('#removeRent').show(); 
                    }

                }).then( async function (renting){
                   
                });
                
            }
        });     
    },

    //create a rent contract for the selected estate
    rentEstate: async function () {
        var price = $('#monthlyPrice').val();
        var downPayment = $('#downPayment').val();
        App.contracts.RealEstate.at(selectedEstate).then(async function (instance) {
            await instance.rent(price, downPayment);
        }).then(async function (){
            alert("Rent contract created!");
            return App.showEstateInfos();
        });
    },

    //sign the rent contract of the selected estate
    signRent: async function () {
        App.contracts.RealEstate.at(selectedEstate).then(async function (instance) {
            return instance.getRenting();
        }).then(async function (rent){
            App.contracts.RentContract.at(rent).then(async function (instance) {
                await instance.signRenting({
                    from: App.account,
                    value: $('#amountMoneySignRent').val(),
                    gas: 500000 // Gas limit
                });
                alert("Rent contract signed!");
                return App.showEstateInfos();
            });
        });
    },

    //pay the rent to the rent contract
    payRent: async function () {
        App.contracts.RealEstate.at(selectedEstate).then(async function (instance) {
            return instance.getRenting();
        }).then(async function (rent){
            App.contracts.RentContract.at(rent).then(async function (instance) {
                await instance.payRent({
                    from: App.account,
                    value: $('#amountMoneyPayRent').val(),
                    gas: 500000 // Gas limit
                });
                alert("Rent paid!");
                return App.showEstateInfos();
            });
        });
    },

    //ask the unclaimed rent from the rent contract
    askRent: async function () {
        App.contracts.RealEstate.at(selectedEstate).then(async function (instance) {
            return instance.getRenting();
        }).then(async function (rent){
            App.contracts.RentContract.at(rent).then(async function (instance) {
                await instance.askRent();
                alert("Rent claimed!");
                return App.showEstateInfos();
            });
        });
    },

    //transfert the ownership of an estate
    transfertEstate: async function () {
        reciever = $('#recieverAdress').val();
        App.contracts.EstateFactory.at(App.factoryAddress).then(async function (instance) {
            
            estateFactoryInstance = instance;
            await estateFactoryInstance.transfertOwnership(selectedEstate, reciever);
            alert("Ownership of the estate transfered!");
            $('#ownerAdress').value = owner;
            App.loadEstates();
        });
    },

    //remove the rent contract if unsigned
    removeRent: async function () {
        App.contracts.RealEstate.at(selectedEstate).then(async function (instance) {
            await instance.removeRent();
            alert("Rent contract removed!");
            return App.showEstateInfos();
        });
    },

    //break the rent contract
    stopRent: async function () {
        App.contracts.RealEstate.at(selectedEstate).then(async function (instance) {
            return instance.getRenting();
        }).then(async function (rent){
            App.contracts.RentContract.at(rent).then(async function (instance) {
                await instance.stopRenting();
                alert("Rent terminated!");
                return App.showEstateInfos();
            });
        });
    },

    //change the factory address
    changeRef: async function () {
        App.factoryAddress = $('#factoryNewAddress').val();
        App.initManagePage();
    },

}

$(function () {
    $(window).load(function () {
        App.init();
    })
});
