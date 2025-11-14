async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: ", deployer.address);
  
    const BatchContract = await ethers.getContractFactory("BatchContract");
  
    const batchContract = await BatchContract.deploy();

    console.log("Contract deployed | Address: ", await batchContract.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });