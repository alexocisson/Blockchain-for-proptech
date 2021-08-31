// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.8.0; //oldest compatible compiler version

import "./RentContract.sol";


contract EstateFactory{
    address public owner;
    mapping (address => RealEstate[]) public estateRegistery;

    //constructor of the contract, sets the owner
    constructor(address _owner) public
    {
        owner = _owner;
    }

    //creates a real estate with its name and the adress of the owner
    function createEstate(address payable estateOwner, bytes32 name) public
    {
        require(msg.sender == owner);
        RealEstate estate = new RealEstate(estateOwner, address(this), name);
        addEstate(estateOwner, estate);
    }

    //transfert the ownership of a real estate with its address and the address of the reciever
    function transfertOwnership(address estate, address receiver) public
    {
        require(msg.sender == RealEstate(estate).owner());
        address originalOwner = RealEstate(estate).owner();
        RealEstate(estate).transfert(receiver);
        removeEstate(originalOwner, RealEstate(estate));
        addEstate(receiver, RealEstate(estate));
    }

    //returns the number of real estates associated to an address
    function getNumberOfEstates(address ownerAddress) external view returns (uint)
    {
        return estateRegistery[ownerAddress].length;
    }

    //get the real estate of an owner at a specific address
    function getEstateAtNb(address ownerAddress, uint index) external view returns (RealEstate)
    {
        require(index<estateRegistery[ownerAddress].length);
        return estateRegistery[ownerAddress][index];
    }

    //return the owner of the factory
    function getOwner() external view returns (address)
    {
        return owner;
    }

    //internal tools
    function addEstate(address ownerAddress, RealEstate estate) private
    {
        estateRegistery[ownerAddress].push(estate);
    }

    function removeEstate(address ownerAddress, RealEstate estate) private
    {
        bool deleted = false;
        for (uint i = 0; i<estateRegistery[ownerAddress].length-1&&!deleted; i++){
            if (estateRegistery[ownerAddress][i] == estate)
            {
                delete estateRegistery[ownerAddress][i];
                estateRegistery[ownerAddress][i] = estateRegistery[ownerAddress][estateRegistery[ownerAddress].length-1];
                //delete estateRegistery[ownerAddress][estateRegistery[ownerAddress].length-1];
                estateRegistery[ownerAddress].pop();
                deleted = true;
            }
        }
        if (!deleted)
        {
            //delete estateRegistery[ownerAddress][estateRegistery[ownerAddress].length-1];
            estateRegistery[ownerAddress].pop();
        }
    }

}

contract RealEstate{
    address payable public owner; 
    address public factory;
    bytes32 public name;
    RentContract public renting;    
    
    //constructor of the contract, sets the owner, the factory and its name
    constructor(address payable _owner, address _factory, bytes32 _name) public
    {
        require(msg.sender == _factory);
        owner = _owner;
        factory = _factory;
        name = _name;
    }
    
    //change the owner of the estate, called by the factory
    function transfert(address receiver) public
    {
        require(msg.sender == factory);
        removeRent();
        owner = address(uint160(receiver));
    }
    
    //create a new rent contract for the estate
    function rent(uint price, uint downPayment) public
    {
        require(msg.sender == owner);
        if(address(renting)!=address(0) && renting.isRenting())
        {
            renting.stopRenting();
        }
        renting = new RentContract(owner, price, downPayment);
    }

    //clear the rent contract
    function removeRent() public
    {
        require(msg.sender == owner||msg.sender == factory);
        if(address(renting)!=address(0))
        {
            if (renting.isRenting())
            {
                renting.stopRenting();
            }
            renting=RentContract(address(0));
        }
    }
    
    //returns the owner
    function getOwner() external view returns (address)   //view to return a value from the blockchain, pure for a value calculated in the funct
    {
        return owner;
    }

    //returns the rent contract
    function getRenting() external view returns (RentContract)   //view to return a value from the blockchain, pure for a value calculated in the funct
    {
        return renting;
    }

    //returns the name of the estate
    function getName() external view returns (bytes32)   //view to return a value from the blockchain, pure for a value calculated in the funct
    {
        return name;
    }
    
}