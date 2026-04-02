// Main entry — re-exports all modules
export { STATUS_NETWORK, addToMetaMask } from './config/network.js';
export { estimateGasKarmaAware, isGasless, sendGaslessTransaction, buildTransactionUI } from './gas/gasless.js';
export { getUserKarmaTier, calculateDiscount, createKarmaContracts } from './karma/reputation.js';
