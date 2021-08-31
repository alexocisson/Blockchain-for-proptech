// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.8.0; //oldest compatible compiler version


contract RentContract{
    address payable public lessor;    //celui qui loue l'apart a qq1
    address payable public lessee; //locataire
    uint public price;  //le prix par mois
    uint public downPayment;  //la caution
    uint public storedMoney;  //l'argent accumulé par le locataire
    bool public isRenting;  //ya-t-il un locataire?
    uint public rentSignDate;  //date de signature de la location en cours
    uint public monthPayedNb;  //nombre de mois qui ont été payés dans la location actuelle
            
    //constructor of the contract, price in wei
    constructor(address payable _lessor, uint _price, uint _downPayment) public payable    
    {
        lessor = _lessor;
        price = _price;
        downPayment = _downPayment;
        isRenting = false;
    }
    
    //allows an address to sign the rent
    function signRenting() public payable
    {
        if (msg.value < downPayment||isRenting)
        {
            revert();       //annule la transaction
        }
        isRenting = true;
        lessee = msg.sender;
        storedMoney = msg.value;
        rentSignDate = block.timestamp;
        monthPayedNb = 0;
    }
    
    //allows the lessee to stock ethers on the contract for the rent
    function payRent() public payable
    {
        if (msg.sender != lessee || !isRenting)
        {
            revert();
        }
        storedMoney += msg.value;
    }
    
    //allows the lessor to claim his rent, break the contract if insufficent funds
    function askRent() public
    {
        require(msg.sender == lessor);
        require(isRenting);
         uint monthToPay = block.timestamp - rentSignDate; //nombre de secondes depuis la signature
            uint monthNotPaid = monthToPay - monthPayedNb;
            if (storedMoney > price*monthToPay)
            {
                lessor.transfer(price*monthToPay);
                storedMoney -= price*monthToPay;
                monthPayedNb += monthToPay;
            }
            else
            {
                lessor.transfer(storedMoney);
                isRenting = false;
            }
    }

    //allows lessor and lesse to break the contract, remaining funds sent to the other party
    function stopRenting() public
    {
        require(isRenting);
        require(msg.sender == lessor || msg.sender == lessee);
        if (msg.sender == lessor)
        {
            lessee.transfer(storedMoney);
        }
        else if (msg.sender == lessee)
        {
            lessor.transfer(storedMoney);
        }
        isRenting = false;
    }

    //returns the lessor
    function getLessor() external view returns (address)
    {
        return lessor;
    }
    
    //returns the lessee
    function getLessee() external view returns (address)
    {
        return lessee;
    }

    //returns the price
    function getPrice() external view returns (uint)
    {
        return price;
    }

    //returns the rent
    function getIsRenting() external view returns (bool)
    {
        return isRenting;
    }

    //returns the stored money
    function getStoredMoney() external view returns (uint)
    {
        return storedMoney;
    }

    //returns the down payment value
    function getDownPayment() external view returns (uint)
    {
        return downPayment;
    }

    //calculate and returns the months of rent not claimed by the owner
    function getMonthNotClaimed() external view returns (uint)
    {
        return block.timestamp - rentSignDate - monthPayedNb;
    }
}