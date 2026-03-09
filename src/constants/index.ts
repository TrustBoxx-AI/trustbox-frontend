

/* ── Backend URL ─────────────────────────────────────── */
export const API_URL =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://trustbox-backend-kxkr.onrender.com"
    : "http://localhost:4000";

/* ── Chain explorers ─────────────────────────────────── */
export const FUJI_EXPLORER   = "https://testnet.snowtrace.io";
export const HEDERA_EXPLORER = "https://hashscan.io/testnet";

/* ── Avalanche Fuji contract addresses ──────────────── */
export const CONTRACTS = {
  TRUST_REGISTRY:     "0x8A24ea199EAAbc8AAcb7cb92660FD20a2BA2552A",
  AUDIT_REGISTRY:     "0x62e2Ba19a38AcA58B829aEC3ED8Db9bfd89D5Fd3",
  INTENT_VAULT:       "0xB9aE50f6989574504e6CA465283BaD9570944B67",
  AGENT_MARKETPLACE:  "0x12d7ef9627d0F4c6C6e0EB85A4D6388cee5d91c2",
  FUNCTIONS_CONSUMER: "0xB275C85ac5AD6F063E038245Bae137d42Dd5Ba19",
};

/* ── Fuji chain config ───────────────────────────────── */
export const FUJI_CHAIN_ID = 43113;
export const FUJI_RPC      = "https://api.avax-test.network/ext/bc/C/rpc";

/* ── Accent hex lookup (CSS var → hex) ──────────────── */
export const ACCENT_HEX: Record<string, string> = {
  "--c-blue":   "#52b6ff",
  "--c-teal":   "#00e5c0",
  "--c-amber":  "#ffb347",
  "--c-pink":   "#ff6eb4",
  "--c-purple": "#a78bfa",
  "--c-red":    "#ff4d6a",
};

/* ── Action metadata ─────────────────────────────────── */
export const ACTION_META: Record<string, { label: string; icon: string; color: string }> = {
  score:      { label:"Credit Score",   icon:"◉",  color:"#00e5c0" },
  audit:      { label:"Audit",          icon:"⚿",  color:"#ffb347" },
  blindaudit: { label:"Blind Audit",    icon:"🔒", color:"#a78bfa" },
  verify:     { label:"Verify Agent",   icon:"◈",  color:"#52b6ff" },
  execute:    { label:"Execute Intent", icon:"⟡",  color:"#ffb347" },
  scan:       { label:"Security Scan",  icon:"⚙",  color:"#ff6eb4" },
  register:   { label:"Register Agent", icon:"◉",  color:"#52b6ff" },
};

/* ── Score bands ─────────────────────────────────────── */
export const SCORE_BANDS: Record<number, {
  label: string; range: string; color: string; bg: string;
}> = {
  1: { label:"Poor",      range:"300–579", color:"#ff4d6a", bg:"rgba(255,77,106,.07)"  },
  2: { label:"Fair",      range:"580–669", color:"#ffb347", bg:"rgba(255,179,71,.07)"  },
  3: { label:"Good",      range:"670–739", color:"#52b6ff", bg:"rgba(82,182,255,.07)"  },
  4: { label:"Excellent", range:"740–850", color:"#00e5c0", bg:"rgba(0,229,192,.07)"   },
};

/* ── Storage keys ────────────────────────────────────── */
export const STORAGE_KEYS = {
  WALLET: "tb_wallet_address",
  JWT:    "tb_jwt_token",
  THEME:  "tb_theme",
} as const;

/* ── Entity type interfaces ──────────────────────────── */
export interface EntityField {
  name:        string;
  label:       string;
  placeholder: string;
  type:        string;
}

export interface EntityType {
  id:              string;
  icon:            string;
  label:           string;
  desc:            string;
  action:          string;
  actionIcon:      string;
  actionLabel:     string;
  accentVar:       string;
  badge?:          string;
  badgeColor?:     string;
  chainTarget?:    string;
  requiresWallet?: string;
  fields:          EntityField[];
}

/* ── Entity types ────────────────────────────────────── */
export const ENTITY_TYPES: EntityType[] = [
  {
    id:             "credit-profile",
    icon:           "◉",
    label:          "Credit Profile",
    desc:           "Submit financial data for AI-scored, ZK-proven credit assessment anchored on Hedera HCS.",
    action:         "score",
    actionIcon:     "◎",
    actionLabel:    "Score Profile",
    accentVar:      "--c-teal",
    badge:          "ZK-Proven",
    badgeColor:     "#00e5c0",
    chainTarget:    "hedera",
    requiresWallet: "evm",
    fields: [
      { name:"walletAddress",   label:"Wallet Address",    placeholder:"0x…",       type:"text" },
      { name:"hederaAccountId", label:"Hedera Account ID", placeholder:"0.0.12345", type:"text" },
    ],
  },
  {
    id:             "smart-contract",
    icon:           "⚿",
    label:          "Smart Contract",
    desc:           "Anchor an automated security audit report to AuditRegistry.sol on Avalanche Fuji.",
    action:         "audit",
    actionIcon:     "⚿",
    actionLabel:    "Audit Contract",
    accentVar:      "--c-amber",
    badge:          "On-Chain",
    badgeColor:     "#ffb347",
    chainTarget:    "avalanche",
    requiresWallet: "evm",
    fields: [
      { name:"contractAddress", label:"Contract Address", placeholder:"0x…",           type:"text" },
      { name:"contractName",    label:"Contract Name",    placeholder:"MyToken",        type:"text" },
      { name:"chain",           label:"Chain",            placeholder:"avalanche-fuji", type:"text" },
    ],
  },
  {
    id:             "code-bundle",
    icon:           "🔒",
    label:          "Code Bundle",
    desc:           "Submit encrypted code for a blind TEE audit — the operator never sees your source.",
    action:         "blindaudit",
    actionIcon:     "🔒",
    actionLabel:    "Blind Audit",
    accentVar:      "--c-purple",
    badge:          "TEE Protected",
    badgeColor:     "#a78bfa",
    chainTarget:    "avalanche",
    requiresWallet: "evm",
    fields: [
      { name:"contractAddress", label:"Contract Address", placeholder:"0x…",         type:"text" },
      { name:"agentId",         label:"Agent ID",         placeholder:"agt_sec_001", type:"text" },
      { name:"projectName",     label:"Project Name",     placeholder:"My Protocol", type:"text" },
    ],
  },
  {
    id:             "intent-command",
    icon:           "⟡",
    label:          "Intent Command",
    desc:           "Natural language → cryptographically signed on-chain execution via Chainlink.",
    action:         "execute",
    actionIcon:     "⟡",
    actionLabel:    "Execute Intent",
    accentVar:      "--c-amber",
    badge:          "Chainlink",
    badgeColor:     "#ffb347",
    chainTarget:    "both",
    requiresWallet: "evm",
    fields: [
      { name:"nlText",   label:"Describe Your Intent", placeholder:"Book a flight from Lagos to London next Friday…", type:"textarea" },
      { name:"category", label:"Category",             placeholder:"Travel Booking", type:"text" },
    ],
  },
  {
    id:             "ai-agent",
    icon:           "◈",
    label:          "AI Agent",
    desc:           "Register an AI agent as a TrustBox NFT with auditable on-chain trust metadata.",
    action:         "verify",
    actionIcon:     "◈",
    actionLabel:    "Verify Agent",
    accentVar:      "--c-blue",
    badge:          "ERC-8004",
    badgeColor:     "#52b6ff",
    chainTarget:    "avalanche",
    requiresWallet: "evm",
    fields: [
      { name:"agentName",    label:"Agent Name",   placeholder:"SecureAudit Pro", type:"text" },
      { name:"model",        label:"Model",        placeholder:"gpt-4o",          type:"text" },
      { name:"operator",     label:"Operator",     placeholder:"0x…",             type:"text" },
      { name:"capabilities", label:"Capabilities", placeholder:"Audit, ZK Proof", type:"text" },
    ],
  },
  {
    id:             "security-agent",
    icon:           "⚙",
    label:          "Security Agent",
    desc:           "List your agent on the marketplace — stake AVAX, publish TEE endpoint, earn verifiably.",
    action:         "scan",
    actionIcon:     "⚙",
    actionLabel:    "Scan Agent",
    accentVar:      "--c-pink",
    badge:          "Marketplace",
    badgeColor:     "#ff6eb4",
    chainTarget:    "avalanche",
    requiresWallet: "evm",
    fields: [
      { name:"agentId",     label:"Agent ID",     placeholder:"agt_001",   type:"text" },
      { name:"teeUrl",      label:"TEE Endpoint", placeholder:"https://…", type:"text" },
      { name:"stakeAmount", label:"Stake (AVAX)", placeholder:"10",        type:"text" },
    ],
  },
];
