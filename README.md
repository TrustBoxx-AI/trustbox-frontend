# TrustBox AI — Frontend

> React 18 + TypeScript frontend for TrustBox AI — the verifiable trust infrastructure for AI agents.

**Backend repo:** [trustbox-backend](https://github.com/trustboxx-ai/trustbox-backend)  
**Live app:** https://trustbox-ai.vercel.app

---

## Project Structure

```
src/
├── pages/
│   ├── Landing.tsx          # Home page — feature overview + chain badges
│   ├── Dashboard.tsx        # Main app — entity selection + all 6 workflows
│   ├── HistoryPage.tsx      # Activity history — scores, audits, intents, agents
│   └── Marketplace.tsx      # Agent marketplace — browse + hire verified agents
│
├── components/
│   └── ResultsDrawer.tsx    # Workflow results + HITL approval UI
│
├── hooks/
│   ├── useWallet.ts         # MetaMask connect, network switch, account state
│   ├── useAuth.ts           # EIP-191 wallet sign-in → JWT auth flow
│   ├── useHistory.ts        # Fetches all history endpoints from backend
│   └── useDashboard.ts      # Dashboard stats (score band, audit count, etc.)
│
├── context/
│   ├── WalletContext.tsx    # Global wallet state provider
│   └── AuthContext.tsx      # Global JWT auth state provider
│
├── constant.ts              # API_URL, contract addresses, entity configs, score bands
└── App.tsx                  # Routes: / · /dashboard · /history · /market
```

---

## Pages

### `/` — Landing
Marketing page. Describes all six TrustBox workflows with chain badges (Avalanche, Hedera, Chainlink, Groq, Phala TEE). MetaMask connect button routes to `/dashboard`.

### `/dashboard` — Dashboard
The core app. Users select an entity type (Credit Profile, Smart Contract, AI Agent, Intent Command, Security Agent, Code Bundle), fill in entity details, then trigger a workflow. A canvas-based TrustBox animates through states: `processing → anchoring → proved`. Results open in a side drawer.

### `/history` — History
Tabbed view of all on-chain activity: ZK credit scores, HITL audits, intent executions, and ERC-8004 agent NFTs. Each record links to Snowtrace (Avalanche) or HashScan (Hedera).

### `/market` — Marketplace
Browse verified AI agents registered on `AgentMarketplace.sol`. Shows trust score, capabilities, TEE status, and stake amount.

---

## The Six Workflows

| Workflow | Entity Type | Key Action |
|---|---|---|
| ZK Credit Score | Credit Profile | Proves score band on Hedera without revealing raw number |
| Contract Audit (HITL) | Smart Contract | AI analyses → human signs findings → chain anchors |
| Verify AI Agent | AI Agent | Mints ERC-8004 credential NFT on TrustRegistry.sol |
| Execute Intent | Intent Command | NL → JSON spec → user signs specHash → IntentVault.sol |
| Security Agent Scan | Security Agent | Behavioural scan + AVAX stake on AgentMarketplace.sol |
| Blind TEE Audit | Code Bundle | Phala SGX enclave audit — source never exposed |

---

## Running Locally

### Prerequisites
- Node.js 18+
- MetaMask browser extension
- Avalanche Fuji added to MetaMask:
  - Network name: `Avalanche Fuji`
  - RPC URL: `https://api.avax-test.network/ext/bc/C/rpc`
  - Chain ID: `43113`
  - Symbol: `AVAX`
  - Explorer: `https://testnet.snowtrace.io`
- Test AVAX from https://faucet.avax.network

### Install and run

```bash
git clone https://github.com/YOUR_ORG/trustbox-frontend
cd trustbox-frontend
npm install
npm run dev
# Opens http://localhost:5173
```

The frontend automatically points to the live backend on Render when not running on localhost. To use a local backend, set:

```bash
# src/constant.ts — already handles this via window.location.hostname check
# Just run the backend on port 4000 and the frontend will use http://localhost:4000
```

---

## Environment

No `.env` file needed — all configuration is derived from `window.location.hostname`:

| Context | Backend URL |
|---|---|
| `localhost` | `http://localhost:4000` |
| Any other host | `https://trustbox-backend-kxkr.onrender.com` |

---

## Contract Addresses — Avalanche Fuji (chainId: 43113)

Defined in [`src/constant.ts`](https://github.com/trustboxx-ai/trustbox-frontend/src/constant.ts):

| Contract | Address |
|---|---|
| TrustRegistry | `0x8A24ea199EAAbc8AAcb7cb92660FD20a2BA2552A` |
| AuditRegistry | `0x62e2Ba19a38AcA58B829aEC3ED8Db9bfd89D5Fd3` |
| AgentMarketplace | `0x12d7ef9627d0F4c6C6e0EB85A4D6388cee5d91c2` |
| IntentVault | `0xB9aE50f6989574504e6CA465283BaD9570944B67` |
| FunctionsConsumer | `0xB275C85ac5AD6F063E038245Bae137d42Dd5Ba19` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Wallet | MetaMask via `window.ethereum` (ethers.js v6) |
| Auth | EIP-191 wallet signatures → JWT (7-day TTL) |
| Routing | React Router v6 |
| Hosting | Vercel |

---

## Chainlink Integration

> **Hackathon requirement:** README must link to all files that use Chainlink.

The frontend references Chainlink in three files:

### [`src/constant.ts`](https://github.com/trustboxx-ai/trustbox-frontend/src/constant.ts)

- **Line 23** — `FUNCTIONS_CONSUMER: "0xB275C85ac5AD6F063E038245Bae137d42Dd5Ba19"` — stores the deployed FunctionsConsumer contract address on Fuji used by the Execute Intent workflow
- **Line 155** — Execute Intent entity description references Chainlink as the execution layer
- **Line 160** — `badge: "Chainlink"` — marks the Execute Intent workflow card with the Chainlink badge
- **Line 226** — `"CHAINLINK REQUEST · Fuji Testnet"` — used as an activity log label when an intent parse request is in progress

### [`src/pages/Landing.tsx`](https://github.com/trustboxx-ai/trustbox-frontend/src/pages/Landing.tsx)

- **Feature card** — the Execute Intent workflow card describes: *"Chainlink Automation triggers execution. Chainlink Price Feeds verify financial data."* and displays `{ icon: "⬡", name: "Chainlink", color: "#375BD2" }` as a chain badge
- **Hero section** — Chainlink listed as one of three core chains alongside Hedera and Avalanche
- **Stats bar** — `"3 Chains — Hedera · Avalanche · Chainlink"` displayed in the feature stats row
- **Footer badge row** — Chainlink logo badge displayed with colour `#375BD2`

### [`src/pages/Dashboard.tsx`](https://github.com/trustboxx-ai/trustbox-frontend/src/pages/Dashboard.tsx)

- **Line 373** — `<ChainPill icon="⬡" label="Chainlink" color="#375BD2"/>` rendered inside the Execute Intent results drawer alongside Avalanche and Hedera chain pills, showing the user which chains were involved in their intent execution

### What Chainlink does in this frontend

When a user runs the **Execute Intent** workflow:

1. The user types natural language (e.g. *"Book a hotel in Lagos for 3 nights, budget $200/night"*)
2. The frontend sends the text to `POST /api/intent/parse` on the backend
3. The backend triggers a **Chainlink Functions** request — the DON runs `parseIntent.js` which calls Groq and returns a structured JSON spec
4. The frontend receives the parsed spec, displays it for user review, and requests a MetaMask signature on the `specHash`
5. The signed spec is sent to `POST /api/intent/submit` — the backend writes it to `IntentVault.sol`
6. **Chainlink Automation** monitors `checkUpkeep()` on IntentVault and calls `performUpkeep()` to execute the intent on-chain
7. The frontend polls for the execution result and displays the Snowtrace transaction link
8. Throughout, the `ChainPill` component with the Chainlink label shows the user that Chainlink is part of the execution path

---

## Authentication Flow

1. User clicks **Connect Wallet** → `useWallet.ts` calls `window.ethereum.request({ method: 'eth_requestAccounts' })`
2. If not on Fuji, `useWallet.ts` calls `wallet_switchEthereumChain` / `wallet_addEthereumChain`
3. User clicks **Sign In** → `useAuth.ts` calls `personal_sign` with a timestamped message
4. Signature + wallet address sent to `POST /api/auth/login` → backend returns JWT
5. JWT stored in `localStorage` as `tb_jwt` with expiry `tb_jwt_exp`
6. All authenticated API calls include `Authorization: Bearer <jwt>`

---

## Key Design Decisions

**Single ResultsDrawer for all six workflows** — each workflow has different prepare/approve/submit patterns, chain targets, and result formats. Rather than six separate components, a single state machine handles all of them via per-action config from `constant.ts`. This keeps the codebase DRY while the UX stays contextual.

**specHash signing, not raw text** — when the user approves an intent, they sign the `keccak256` hash of the parsed spec JSON — not the original natural language text. This blocks prompt injection attacks where a malicious instruction could be substituted between the user reading it and approving it.

**Canvas TrustBox animation** — the central visual element animates through states (`idle → processing → anchoring → proved`) with per-action colour coding. For audit workflows it pauses at `awaiting-approval` for the human review step, making the HITL pattern tangible.

**JWT bound to wallet address** — the backend verifies that the wallet address recovered from the EIP-191 signature matches the address in the JWT on every state-changing request. Tokens cannot be transferred between wallets.


*TrustBox AI — Making AI agents trustworthy, verifiable, and accountable.*  
*Built on Avalanche | Secured by Hedera | Automated by Chainlink | Powered by Groq*
