"use strict";
var  TokenBatchTransfer = artifacts.require("./TokenBatchTransfer.sol");

let Contract = require("@truffle/contract");
let TokenAbi = require("singularitynet-token-contracts/abi/SingularityNetToken.json");
let TokenNetworks = require("singularitynet-token-contracts/networks/SingularityNetToken.json");
let TokenBytecode = require("singularitynet-token-contracts/bytecode/SingularityNetToken.json");
let Token = Contract({contractName: "SingularityNetToken", abi: TokenAbi, networks: TokenNetworks, bytecode: TokenBytecode});
Token.setProvider(web3.currentProvider);

var ethereumjsabi  = require('ethereumjs-abi');
var ethereumjsutil = require('ethereumjs-util');
let signFuns       = require('./sign_funcs');

const { assert } = require("chai");

async function testErrorRevert(prom)
{
    let rezE = -1
    try { await prom }
    catch(e) {
        rezE = e.message.indexOf('revert');
        //console.log("Catch Block: " + e.message);
    }
    assert(rezE >= 0, "Must generate error and error message must contain revert");
}
  
contract('TokenBatchTransfer', function(accounts) {

console.log("Number of Accounts - ", accounts.length)

    var tokenBatchTransfer;
    var tokenAddress;
    var token;
    
    let GAmt = 10000  * 100000000;


    before(async () => 
        {
            tokenBatchTransfer = await TokenBatchTransfer.deployed();
            tokenAddress = await tokenBatchTransfer.token.call();
            token = await Token.at(tokenAddress);
        });



        const approveTokensToContract = async(_startAccountIndex, _endAccountIndex, _depositAmt) => {
            // Transfer & Approve amount for respective accounts to Contract Address
            for(var i=_startAccountIndex;i<=_endAccountIndex;i++) {
                await token.transfer(accounts[i],  _depositAmt, {from:accounts[0]});
                await token.approve(tokenBatchTransfer.address,_depositAmt, {from:accounts[i]});
            }

        };

        const updateOwnerAndVerify = async(_newOwner, _account) => {

            let newOwner = "0x0"

            const owner_b = await tokenBatchTransfer.owner.call();
            await tokenBatchTransfer.transferOwnership(_newOwner, {from:_account});

            // Following lines of code if for Claimable Contract - which extends ownable functionality
            /*
            // Owner should not be updated until new Owner Accept the Ownership
            newOwner = await tokenBatchTransfer.owner.call();
            assert.equal(newOwner, owner_b);

            // Call the function to accept the ownership
            await tokenBatchTransfer.claimOwnership({from:_newOwner});
            */
            newOwner = await tokenBatchTransfer.owner.call();

            assert.equal(newOwner, _newOwner);

        }


        const getRandomNumber = (max) => {
            const min = 10; // To avoid zero rand number
            return Math.floor(Math.random() * (max - min) + min);
        }

        const sleep = async (sec) => {
            console.log("Waiting for cycle to complete...Secs - " + sec);
            return new Promise((resolve) => {
                setTimeout(resolve, sec * 1000);
              });
        }


    // ************************ Test Scenarios Starts From Here ********************************************

  
    
    

    it("0. Initial Account Setup - Transfer & Approve Tokens", async function() 
    {
        // accounts[0] -> Contract Owner

        // An explicit call is required to mint the tokens for AGI-II
        //await token.mint(accounts[0], GAmt, {from:accounts[0]});

        //await approveTokensToContract(1, 9, GAmt);

        // Deposit tokens to the contract for the batch transfer
        await token.transfer(tokenBatchTransfer.address, GAmt, {from:accounts[0]});

    });

    it("1. Administrative Operations - Update Owner", async function() 
    {

        // Change the Owner to Accounts[1]
        await updateOwnerAndVerify(accounts[1], accounts[0]);

        // Revert to back the ownership to accounts[0]
        await updateOwnerAndVerify(accounts[0], accounts[1]);

        // Owner Cannot be updated by any other user
        await testErrorRevert(tokenBatchTransfer.transferOwnership(accounts[1], {from:accounts[2]}));

    });

    it("3. Batch Transfers - 1", async function() 
    {

        let tokenHolders = [];
        let amounts = [];
        let max = 100;

        for(var i=1; i<accounts.length; i++) {

            tokenHolders.push(accounts[i]);
            amounts.push(getRandomNumber(max) * 100000000);

        }

        //let contractTokenBalance = (await token.balanceOf(tokenBatchTransfer.address)).toNumber();
        // console.log("Contract Before Balance - ", contractTokenBalance);
        // console.log("Account-1 Before Balance - ", (await token.balanceOf(accounts[1])).toNumber());

        await tokenBatchTransfer.batchTransfer(tokenHolders, amounts);

        //contractTokenBalance = (await token.balanceOf(tokenBatchTransfer.address)).toNumber();

        // console.log("Contract After Balance - ", contractTokenBalance);
        // console.log("Account-1 After Balance - ", (await token.balanceOf(accounts[1])).toNumber());

    });

    it("3. Batch Transfers - 2", async function() 
    {

        let tokenHolders = [];
        let amounts = [];
        let max = 100;

        for(var i=1; i<accounts.length; i++) {

            tokenHolders.push(accounts[i]);
            amounts.push(getRandomNumber(max) * 100000000);

        }

        // Transfer the tokens to contract for 2nd run
        await token.transfer(tokenBatchTransfer.address, GAmt, {from:accounts[0]});

        //let contractTokenBalance = (await token.balanceOf(tokenBatchTransfer.address)).toNumber();
        //console.log("Contract Before Balance - ", contractTokenBalance);
        //console.log("Account-1 Before Balance - ", (await token.balanceOf(accounts[1])).toNumber());

        await tokenBatchTransfer.batchTransfer(tokenHolders, amounts);

        //contractTokenBalance = (await token.balanceOf(tokenBatchTransfer.address)).toNumber();

        //console.log("Contract After Balance - ", contractTokenBalance);
        //console.log("Account-1 After Balance - ", (await token.balanceOf(accounts[1])).toNumber());

    });


});
