
declare const snarkjs: any;

const WASM_URL = "/zk/CreditScore_js/CreditScore.wasm";
const ZKEY_URL = "/zk/CreditScore_final.zkey";

export interface ProofResult {
  proof:         object;
  publicSignals: string[];   // [scoreHash, scoreBand]
  scoreBand:     number;     // 1=Poor 2=Fair 3=Good 4=Excellent
  scoreHash:     string;
  demo:          boolean;    // true when circuit files not available
}

// ── Random salt (bigint decimal string for circom) ─────────────
function randomSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return BigInt(
    "0x" + Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("")
  ).toString();
}

// ── Check if circuit files are served ─────────────────────────
async function circuitFilesAvailable(): Promise<boolean> {
  try {
    const res = await fetch(WASM_URL, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Main: generate Groth16 proof ──────────────────────────────
export async function generateCreditScoreProof(score: number): Promise<ProofResult> {
  if (score < 300 || score > 850) {
    throw new Error(`Score must be between 300 and 850, got ${score}`);
  }

  // Demo fallback when circuit not compiled yet
  const available = await circuitFilesAvailable();
  if (!available || typeof snarkjs === "undefined") {
    console.warn("[zk] Circuit files not found — returning demo proof");
    return buildDemoProof(score);
  }

  const input = {
    score: score.toString(),
    salt:  randomSalt(),
  };

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    WASM_URL,
    ZKEY_URL
  );

  // publicSignals[0] = scoreHash (Poseidon commitment)
  // publicSignals[1] = scoreBand (1–4)
  const scoreBand = Number(publicSignals[1]);
  const scoreHash = publicSignals[0] as string;

  return { proof, publicSignals, scoreBand, scoreHash, demo: false };
}

// ── Demo proof (circuit not yet compiled) ─────────────────────
function buildDemoProof(score: number): ProofResult {
  const scoreBand = scoreToBand(score);
  const scoreHash = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, "0")).join("");

  return {
    proof:         { protocol: "groth16", demo: true },
    publicSignals: [scoreHash, String(scoreBand)],
    scoreBand,
    scoreHash,
    demo:          true,
  };
}

// ── Utility: score → band number ──────────────────────────────
export function scoreToBand(score: number): number {
  if (score < 580) return 1;   // Poor
  if (score < 670) return 2;   // Fair
  if (score < 740) return 3;   // Good
  return 4;                     // Excellent
}

// ── Utility: band → label ─────────────────────────────────────
export function bandLabel(band: number): string {
  return { 1: "Poor", 2: "Fair", 3: "Good", 4: "Excellent" }[band] ?? "Unknown";
}

// ── Estimate credit score from on-chain data heuristics ───────
// Used to auto-populate the score input from connected wallet data.
export function estimateCreditScore(walletData: {
  txCount?:    number;
  balanceEth?: number;
  agedays?:    number;
  nftCount?:   number;
}): number {
  let score = 580; // base: Fair

  // Wallet age → up to +80
  if (walletData.agedays) {
    score += Math.min(80, Math.floor(walletData.agedays / 30) * 5);
  }
  // Transaction count → up to +60
  if (walletData.txCount) {
    score += Math.min(60, Math.floor(walletData.txCount / 10) * 3);
  }
  // ETH balance → up to +80
  if (walletData.balanceEth !== undefined) {
    if      (walletData.balanceEth >= 10)  score += 80;
    else if (walletData.balanceEth >= 1)   score += 40;
    else if (walletData.balanceEth >= 0.1) score += 20;
  }
  // NFT holdings → up to +30
  if (walletData.nftCount) {
    score += Math.min(30, walletData.nftCount * 3);
  }

  return Math.min(850, Math.max(300, score));
}
