const hre = require('hardhat');

async function main() {
  // Replace with actual deployed Karma contract addresses from:
  // https://docs.status.network/overview/general-info/contract-addresses/testnet-contracts
  const KARMA_ADDRESS = process.env.KARMA_ADDRESS || '0x0000000000000000000000000000000000000000';
  const KARMA_TIERS_ADDRESS = process.env.KARMA_TIERS_ADDRESS || '0x0000000000000000000000000000000000000000';

  const StatusNetworkApp = await hre.ethers.getContractFactory('StatusNetworkApp');
  const app = await StatusNetworkApp.deploy(KARMA_ADDRESS, KARMA_TIERS_ADDRESS);
  await app.waitForDeployment();
  console.log('StatusNetworkApp deployed to:', await app.getAddress());

  const KarmaGovernance = await hre.ethers.getContractFactory('KarmaGovernance');
  const gov = await KarmaGovernance.deploy(KARMA_ADDRESS);
  await gov.waitForDeployment();
  console.log('KarmaGovernance deployed to:', await gov.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
