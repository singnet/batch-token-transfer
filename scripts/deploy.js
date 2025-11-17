async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: ", deployer.address);
  
    const BatchContract = await ethers.getContractFactory("TokenBatchTransfer");
  
    const batchContract = await BatchContract.deploy("0xE47A39F774ABbB2b3B8b43088a966BBC0a6Af426");

    console.log("Contract deployed | Address: ", await batchContract.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
