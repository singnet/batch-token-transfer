pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenBatchTransfer is Ownable {

    using SafeMath for uint256;

    ERC20 public token; // Address of token contract

    constructor(address _token)
    public
    {
        token = ERC20(_token);
    }


    // Events
    event WithdrawToken(address indexed owner, uint256 stakeAmount);


    // To withdraw tokens from contract, to deposit directly transfer to the contract
    function withdrawToken(uint256 value) public onlyOwner
    {

        // Check if contract is having required balance 
        require(token.balanceOf(address(this)) >= value, "Not enough balance in the contract");
        require(token.transfer(msg.sender, value), "Unable to transfer token to the owner account");

        emit WithdrawToken(msg.sender, value);
        
    }

    // To transfer tokens from Contract to the provided list of token holders with respective amount
    function batchTransfer(address[] calldata tokenHolders, uint256[] calldata amounts) 
    external 
    onlyOwner
    {
        require(tokenHolders.length == amounts.length, "Invalid input parameters");

        for(uint256 indx = 0; indx < tokenHolders.length; indx++) {
            require(token.transfer(tokenHolders[indx], amounts[indx]), "Unable to transfer token to the account");
        }
    }

}