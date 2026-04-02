// Skill 1 — Network Setup & RPC Config
export const STATUS_NETWORK = {
  networkName: 'Status Network Testnet',
  chainId: 49986,
  chainIdHex: '0xC342',
  rpcUrl: 'https://rpc.testnet.status.network',
  blockExplorerUrl: 'https://sepoliascan.status.network',
  faucet: 'https://faucet.status.network',
  bridge: 'https://bridge.status.network',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
};

// Add Status Network to MetaMask programmatically
export async function addToMetaMask() {
  const { chainIdHex, networkName, nativeCurrency, rpcUrl, blockExplorerUrl } = STATUS_NETWORK;
  return window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: chainIdHex,
      chainName: networkName,
      nativeCurrency,
      rpcUrls: [rpcUrl],
      blockExplorerUrls: [blockExplorerUrl],
    }],
  });
}
