/* ══════════════════════════════════════════════════════
   constants/index.js  —  TrustBox
   All shared data constants. Import from here — never
   define these inline in component files.
   ══════════════════════════════════════════════════════ */

export const ENTITY_TYPES = [
  {
    id: "agent",
    label: "AI Agent",
    icon: "◈",
    accentVar: "--c-blue",
    action: "verify",
    actionLabel: "Verify",
    actionIcon: "✓",
    desc: "Register an autonomous AI agent — model, operator, capabilities",
    fields: [
      { name: "Agent Name",   type: "text",   placeholder: "e.g. ResearchBot v2"        },
      { name: "Model",        type: "text",   placeholder: "e.g. claude-sonnet-4"        },
      { name: "Operator",     type: "text",   placeholder: "e.g. Acme Corp"              },
      { name: "Capabilities", type: "text",   placeholder: "e.g. web_search, code_exec"  },
      { name: "Environment",  type: "select", options: ["production","staging","development"] },
    ],
  },
  {
    id: "contract",
    label: "Smart Contract",
    icon: "⬡",
    accentVar: "--c-amber",
    action: "audit",
    actionLabel: "Audit",
    actionIcon: "⬡",
    desc: "Anchor and audit a smart contract to TrustBox ledger",
    fields: [
      { name: "Contract Name",    type: "text",   placeholder: "e.g. TrustEscrow v1"   },
      { name: "Chain",            type: "select", options: ["Ethereum","Polygon","Arbitrum","Base","Solana"] },
      { name: "Contract Address", type: "text",   placeholder: "0x…"                    },
      { name: "ABI Source",       type: "text",   placeholder: "https://…/abi.json"     },
      { name: "Deployer",         type: "text",   placeholder: "e.g. Acme Finance"      },
    ],
  },
  {
    id: "software",
    label: "AI Software",
    icon: "⌬",
    accentVar: "--c-teal",
    action: "scan",
    actionLabel: "Scan",
    actionIcon: "◎",
    desc: "Register an AI-powered software product or SaaS",
    fields: [
      { name: "Product Name",     type: "text",   placeholder: "e.g. Nexum Analytics"    },
      { name: "Version",          type: "text",   placeholder: "e.g. 2.4.1"              },
      { name: "AI Provider",      type: "text",   placeholder: "e.g. Anthropic / OpenAI" },
      { name: "Category",         type: "select", options: ["analytics","generation","automation","security","other"] },
      { name: "Automation Level", type: "select", options: ["fully-automated","semi-automated","human-in-loop"] },
    ],
  },
  {
    id: "a2a",
    label: "Agent-to-Agent Workflow",
    icon: "↔",
    accentVar: "--c-purple",
    action: "scan",
    actionLabel: "Scan",
    actionIcon: "◎",
    desc: "Log and verify multi-agent communication and handoff chains",
    fields: [
      { name: "Workflow Name",  type: "text",   placeholder: "e.g. Research Pipeline"  },
      { name: "Agent Count",    type: "text",   placeholder: "e.g. 4"                  },
      { name: "Orchestrator",   type: "text",   placeholder: "Agent ID or name"         },
      { name: "Protocol",       type: "select", options: ["sequential","parallel","conditional","loop"] },
      { name: "Trust Boundary", type: "select", options: ["internal","cross-org","public"] },
    ],
  },
  {
    id: "automation",
    label: "AI Automation Workflow",
    icon: "⟳",
    accentVar: "--c-pink",
    action: "scan",
    actionLabel: "Scan",
    actionIcon: "◎",
    desc: "Register an automated workflow — triggers, steps, outputs",
    fields: [
      { name: "Workflow Name", type: "text",   placeholder: "e.g. Lead Enrichment Flow" },
      { name: "Trigger",       type: "select", options: ["scheduled","webhook","event","manual"] },
      { name: "Step Count",    type: "text",   placeholder: "e.g. 12"                   },
      { name: "Platform",      type: "text",   placeholder: "e.g. n8n / Zapier / custom" },
      { name: "Output Type",   type: "select", options: ["data","notification","action","report"] },
    ],
  },
];

export const ACTION_META = {
  verify: { color: "#52b6ff", label: "Verifying" },
  audit:  { color: "#ffb347", label: "Auditing"  },
  scan:   { color: "#00e5c0", label: "Scanning"  },
};

export const ACTION_SCORE = { verify: 94, audit: 76, scan: 87 };

export const STATUS_COLOR = { pass: "#00e5c0", warn: "#ffb347", fail: "#ff4d6a" };
export const STATUS_ICON  = { pass: "✓",       warn: "⚠",       fail: "✕"       };

export const ACCENT_HEX = {
  "--c-blue":   "#52b6ff",
  "--c-amber":  "#ffb347",
  "--c-teal":   "#00e5c0",
  "--c-purple": "#a78bfa",
  "--c-pink":   "#ff6eb4",
};

export const LOG_LINES = {
  verify: [
    "Initiating identity verification…",
    "Fetching TrustBox registry…",
    "Validating cryptographic signature…",
    "Checking model manifest hash…",
    "Cross-referencing operator record…",
    "Evaluating capability scope…",
    "Generating veracity score…",
    "Anchoring result to ledger…",
    "✓ Verification complete.",
  ],
  audit: [
    "Deploying audit smart contract…",
    "Loading event log (1,847 events)…",
    "Computing Merkle tree…",
    "Anchoring root hash to ETH-L2…",
    "Verifying immutability proofs…",
    "Cross-checking governance records…",
    "Running regulatory alignment…",
    "Finalising audit report…",
    "✓ Audit complete.",
  ],
  scan: [
    "Initiating behavioural scan…",
    "Loading fingerprint baseline…",
    "Sampling output distribution…",
    "Analysing data access patterns…",
    "Running exfiltration risk model…",
    "Testing adversarial robustness…",
    "Computing scan score…",
    "Writing audit log…",
    "✓ Scan complete.",
  ],
};

export const MOCK_FINDINGS = {
  verify: [
    { label: "Identity confirmed",   status: "pass", detail: "Cryptographic signature valid"                     },
    { label: "Model registry match", status: "pass", detail: "Hash matches known model manifest"                },
    { label: "Operator credentials", status: "pass", detail: "Operator record exists in TrustBox DB"            },
    { label: "Capabilities scope",   status: "warn", detail: "2 capabilities unregistered — update recommended" },
    { label: "Policy compliance",    status: "pass", detail: "Aligns with EU AI Act Art. 52"                    },
  ],
  audit: [
    { label: "Smart contract deployed", status: "pass", detail: "TrustBox Audit Contract v2.1 anchored on-chain" },
    { label: "Event log integrity",     status: "pass", detail: "All 1,847 events hash-verified"                },
    { label: "Immutability proof",      status: "pass", detail: "Merkle root anchored at block #19,204,871"     },
    { label: "Governance record",       status: "warn", detail: "2 policy updates missing from audit trail"     },
    { label: "Regulatory alignment",    status: "pass", detail: "EU AI Act, NIST AI RMF — compliant"           },
  ],
  scan: [
    { label: "Behavioral fingerprint", status: "pass", detail: "No anomalous patterns detected"              },
    { label: "Data access patterns",   status: "warn", detail: "Unusual read volume on memory module"        },
    { label: "Output entropy check",   status: "pass", detail: "Within normal distribution bounds"          },
    { label: "Exfiltration risk",      status: "pass", detail: "No suspicious outbound traffic detected"    },
    { label: "Adversarial robustness", status: "fail", detail: "Vulnerable to prompt injection — remediate" },
  ],
};

export const TICKER_ITEMS = [
  { c: "#00e5c0", t: "agt_8f2k9x — verify — 94/100"      },
  { c: "#ff4d6a", t: "agt_3k1p0z — anomaly flagged"       },
  { c: "#52b6ff", t: "workflow_0041 — scan — checksum OK" },
  { c: "#00e5c0", t: "a2a_handoff → agt_7y — confirmed"   },
  { c: "#ffb347", t: "contract:0x3a9f — audit complete"   },
  { c: "#52b6ff", t: "nexum.io — identity verified"       },
  { c: "#a78bfa", t: "pipeline_0098 — 14 steps — logged"  },
];

/* Code snippets that float in 3D inside the box */
export const CODE_SNIPPETS = [
  { text: "verify(agent_id)",       col: "#52b6ff" },
  { text: "hash: 0x3a9f…d712",      col: "#00e5c0" },
  { text: "trust_score: 94",        col: "#a78bfa" },
  { text: "signed: true",           col: "#00e5c0" },
  { text: "anchor(block, merkle)",  col: "#52b6ff" },
  { text: "policy: EU_AI_ACT_52",   col: "#ffb347" },
  { text: "operator: verified",     col: "#00e5c0" },
  { text: "emit Registered(id)",    col: "#52b6ff" },
  { text: "scan.entropy: 0.12",     col: "#a78bfa" },
  { text: "ledger.append(event)",   col: "#52b6ff" },
  { text: "contract: 0x4E71…e503",  col: "#ffb347" },
  { text: "model: claude-sonnet-4", col: "#00e5c0" },
];
