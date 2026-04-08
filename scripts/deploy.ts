import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  const StackBase = await ethers.getContractFactory("StackBase");
  console.log("Deploying StackBase...");

  const contract = await StackBase.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("StackBase deployed to:", address);
  console.log("");
  console.log("To verify:");
  console.log(`npx hardhat verify --network baseSepolia ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
