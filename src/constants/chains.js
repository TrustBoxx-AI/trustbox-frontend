/* constants/chains.js — TrustBox
   Chain configurations for Avalanche Fuji + Hedera Testnet.
   Contract addresses are placeholders until deployment.
   ─────────────────────────────────────────────────────── */

export const CHAINS = {
  avalanche: {
    id:          "avalanche",
    name:        "Avalanche",
    network:     "Fuji Testnet",
    chainId:     43113,
    rpcUrl:      "https://api.avax-test.network/ext/bc/C/rpc",
    symbol:      "AVAX",
    color:       "#E84142",
    icon:        "▲",
    explorer:    "https://testnet.snowtrace.io",
    faucet:      "https://faucet.avax.network",
    contracts: {
      trustRegistry:    "0x0000000000000000000000000000000000000001", /* placeholder */
      agentMarketplace: "0x0000000000000000000000000000000000000002", /* placeholder */
      intentVault:      "0x0000000000000000000000000000000000000003", /* placeholder */
    },
  },

  hedera: {
    id:          "hedera",
    name:        "Hedera",
    network:     "Testnet",
    accountPrefix: "0.0.",
    symbol:      "HBAR",
    color:       "#8259EF",
    icon:        "ℏ",
    explorer:    "https://hashscan.io/testnet",
    portal:      "https://portal.hedera.com",
    topics: {
      creditScore: "0.0.000001", /* placeholder */
      securityAudit: "0.0.000002", /* placeholder */
      intentExecution: "0.0.000003", /* placeholder */
    },
  },
};

/* Which chain handles which feature */
export const FEATURE_CHAIN = {
  score:   "hedera",
  audit:   "avalanche",
  execute: "both",
};

/* Chainlink configs on Fuji */
export const CHAINLINK = {
  subscriptionId: null,          /* set after subscription creation */
  donId:          "fun-avalanche-fuji-1",
  routerAddress:  "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0",
  linkToken:      "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
  automationRegistry: "0x819B58A646CDd8289275A87653a2aA4902b14fe6",
};
