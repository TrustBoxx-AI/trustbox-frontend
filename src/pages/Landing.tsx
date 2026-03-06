/* Landing.tsx — TrustBox marketing page
   Exact 1:1 conversion from Landing.jsx.
   Changes made:
     1. `setRoute` prop removed → replaced with useNavigate() hook
     2. Import: "../constants" (the folder with index.jsx)
     3. TypeScript types added where needed (as any casts on ENTITY_TYPES)
     4. opacity:0 on animated elements removed (animation fill-mode "both" handles it)
*/

import { useNavigate }                           from "react-router-dom";
import Ticker                                    from "../components/Ticker";
import { ENTITY_TYPES, ACTION_META, ACCENT_HEX } from "../constants";

const FEATURES = [
  {
    id:         "credit",
    icon:       "◉",
    label:      "Verifiable Credit Score",
    tagline:    "AI analyses your financial data and produces a provable credit score — transparent methodology, completely private data.",
    problem:    "Credit scoring is a black box controlled by a handful of companies. Methodology is opaque. Data handling is unaccountable. You can't verify your own score.",
    solution:   "Financial data is encrypted client-side before it leaves your device. AI scores inside a Trusted Execution Environment. A ZK proof lets anyone verify the result without seeing a single data point you didn't choose to share. Anchored immutably on Hedera HCS.",
    chains:     [{ icon:"ℏ", name:"Hedera HCS", color:"#8259EF" }],
    badge:      "ZK-Proven",
    badgeColor: "#00e5c0",
    accent:     "#00e5c0",
    action:     "Score Your Profile",
  },
  {
    id:         "security",
    icon:       "⚿",
    label:      "Private Security Agent",
    tagline:    "Submit your code to a security agent that audits it — without the agent operator ever being able to read, copy, or steal your source.",
    problem:    "Security auditors see your code. They could find vulnerabilities you haven't patched yet, steal your IP, or remember proprietary logic. The trust model is broken.",
    solution:   "Your code is encrypted with the agent's public key before upload — the encrypted blob is all that travels. Blind computation runs inside a Phala Network TEE (Intel SGX). A hardware-signed attestation, anchored on Avalanche, proves the scan ran correctly without the operator decrypting a line.",
    chains:     [{ icon:"▲", name:"Avalanche", color:"#E84142" }],
    badge:      "TEE Protected",
    badgeColor: "#a78bfa",
    accent:     "#a78bfa",
    action:     "Start Private Audit",
  },
  {
    id:         "intent",
    icon:       "⟡",
    label:      "Verifiable Intent Engine",
    tagline:    "Natural language → verified on-chain action. 'Book NYC under $400.' 'Rebalance 60/40.' 'Tip top 3 contributors $10.'",
    problem:    "When an AI agent executes actions on your behalf — touching money, accounts, or data — you have no way to verify that what ran matches what you asked for. Zero auditability.",
    solution:   "Your intent is parsed by AI into a structured spec, shown to you for review, then cryptographically signed. The approved hash is submitted to IntentVault.sol. Chainlink Automation triggers execution. Chainlink Price Feeds verify financial data. Hedera HCS records the entire trail: intent → approval → execution → verification.",
    chains:     [
      { icon:"▲", name:"Avalanche",  color:"#E84142" },
      { icon:"ℏ", name:"Hedera HCS", color:"#8259EF" },
      { icon:"⬡", name:"Chainlink",  color:"#375BD2" },
    ],
    badge:      "Chainlink Powered",
    badgeColor: "#ffb347",
    accent:     "#ffb347",
    action:     "Execute an Intent",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  function setRoute(r: string) {
    if (r === "dashboard")        navigate("/dashboard");
    else if (r === "marketplace") navigate("/market");
    else                          navigate("/");
  }

  return (
    <div className="grid-bg">
<br></br><br></br>
      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center px-12 pt-28 pb-20 overflow-hidden">
        <div className="absolute pointer-events-none"
             style={{ top:-160, left:-160, width:700, height:700, borderRadius:"50%",
                      background:"radial-gradient(circle, rgba(82,182,255,0.055) 0%, transparent 70%)" }}/>
        <div className="absolute pointer-events-none"
             style={{ top:"50%", right:0, width:400, height:400, borderRadius:"50%",
                      background:"radial-gradient(circle, rgba(167,139,250,0.03) 0%, transparent 70%)" }}/>

        <p className="flex items-center gap-3 mb-7"
           style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".24em",
                    textTransform:"uppercase", color:"#52b6ff", animation:"fadeUp .6s ease both .2s" }}>
          <span style={{ display:"block", width:32, height:1, background:"#52b6ff" }}/>
          AI Provability Infrastructure · Hedera · Avalanche · Chainlink
        </p>

        <h1 className="mb-6"
            style={{ maxWidth:820, fontFamily:"'IBM Plex Serif',serif",
                     fontSize:"clamp(40px,6vw,78px)", fontWeight:300,
                     lineHeight:1.07, animation:"fadeUp .7s ease both .35s" }}>
          Trust is not assumed.<br/>
          <em style={{ fontStyle:"italic", color:"#52b6ff" }}>It is proven.</em>
        </h1>

        <p className="mb-10"
           style={{ maxWidth:520, fontSize:15, fontWeight:300, lineHeight:1.8,
                    color:"rgba(255,255,255,.38)", animation:"fadeUp .7s ease both .5s" }}>
          TrustBox is the transparency layer for AI. Verifiable credit scores, private code audits,
          and cryptographically signed intent execution — anchored on Hedera, Avalanche, and Chainlink.
        </p>
<br></br>
        {/* chain badges */}
        <div className="flex gap-2 flex-wrap mb-10" style={{ animation:"fadeUp .7s ease both .6s" }}>
          {[
            { icon:"ℏ", label:"Hedera HCS",    color:"#8259EF" },
            { icon:"▲", label:"Avalanche Fuji", color:"#E84142" },
            { icon:"⬡", label:"Chainlink",      color:"#375BD2" },
            { icon:"⚙", label:"Phala TEE",      color:"#00e5c0" },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-1 border"
                 style={{ padding:"6px 12px", borderColor:`${c.color}44`, background:`${c.color}0d`,
                          fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:c.color }}>
              {c.icon} {c.label}
            </div>
          ))}
        </div>
          <br></br><br></br>
        <div className="flex gap-4 flex-wrap" style={{ animation:"fadeUp .7s ease both .65s" }}>
          <button className="btn-p" onClick={() => setRoute("dashboard")}>Explore →</button>
          <button className="btn-g" onClick={() => setRoute("marketplace")}>Agent Marketplace ⚿</button>
        </div>

        {/* stats */}
        <div className="flex flex-wrap mt-20 pt-8"
             style={{ borderTop:"1px solid rgba(255,255,255,.055)", animation:"fadeUp .7s ease both .85s" }}>
          {[
            ["12.4M+",  "Events anchored"],
            ["99.99%",  "Uptime SLA"],
            ["< 8ms",   "Write latency"],
            ["3 Chains","Hedera · Avalanche · Chainlink"],
            ["SOC 2",   "Type II"],
          ].map(([n, l], i, arr) => (
            <div key={l} className="mb-4"
                 style={{ paddingRight:40, marginRight:40,
                          borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,.055)" : "none" }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:500,
                            letterSpacing:"-.02em", marginBottom:4 }}>{n}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".18em",
                            textTransform:"uppercase", color:"rgba(255,255,255,.2)" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <Ticker />
          <br></br><br></br>
      {/* ── Flagship Features ────────────────────────── */}
      <section className="relative z-10 px-12 py-28"
               style={{ borderTop:"1px solid rgba(255,255,255,.05)" }}>
        <p className="flex items-center gap-3 mb-5"
           style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em",
                    textTransform:"uppercase", color:"#52b6ff" }}>
          <span style={{ display:"block", width:24, height:1, background:"#52b6ff" }}/>
          Flagship Products
        </p>
        <h2 className="mb-4"
            style={{ maxWidth:620, fontFamily:"'IBM Plex Serif',serif",
                     fontSize:"clamp(26px,4vw,52px)", fontWeight:300, lineHeight:1.1 }}>
          AI that proves itself — or doesn't run.
        </h2>
        <p className="mb-16"
           style={{ maxWidth:500, fontSize:14, fontWeight:300,
                    color:"rgba(255,255,255,.3)", lineHeight:1.8 }}>
          Three products. Three unsolved problems in AI trust. Each result is independently
          verifiable — without trusting TrustBox.
        </p>

        <div className="flex flex-col gap-6">
          {FEATURES.map((f, fi) => (
            <div key={f.id} className="border overflow-hidden"
                 style={{ borderColor:`${f.accent}22`, background:"rgba(255,255,255,.008)",
                          transition:"background .2s" }}
                 onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.018)"}
                 onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.008)"}>

<br></br>
              {/* header */}
              <div className="flex items-center justify-between px-8 py-5 border-b flex-wrap gap-4"
                   style={{ borderColor:`${f.accent}18`, background:`${f.accent}06` }}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center shrink-0"
                       style={{ width:40, height:40, border:`1px solid ${f.accent}44`,
                                color:f.accent, fontFamily:"'IBM Plex Mono',monospace", fontSize:20 }}>
                    {f.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14,
                                     fontWeight:500, color:"#e8eaf0" }}>{f.label}</span>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7,
                                     letterSpacing:".12em", textTransform:"uppercase",
                                     color:f.badgeColor, border:`1px solid ${f.badgeColor}44`,
                                     padding:"2px 6px" }}>{f.badge}</span>
                    </div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                                  color:"rgba(255,255,255,.22)" }}>
                      Module {String(fi + 1).padStart(2, "0")}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap shrink-0">
                  {f.chains.map(c => (
                    <div key={c.name} className="flex items-center gap-1 border"
                         style={{ padding:"4px 10px", borderColor:`${c.color}44`, background:`${c.color}0d`,
                                  fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:c.color }}>
                      {c.icon} {c.name}
                    </div>
                  ))}
                </div>
              </div>

              <br></br>

              {/* body — 3-col responsive */}
              <div className="grid px-8 py-7 gap-8"
                   style={{ gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))" }}>
                <div>
                  <p style={{ fontSize:15, fontWeight:300, color:"rgba(255,255,255,.7)",
                               lineHeight:1.85, marginBottom:14 }}>{f.tagline}</p>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10,
                               color:"rgba(255,255,255,.28)", lineHeight:1.85 }}>{f.solution}</p>
                </div>

                <div style={{ borderLeft:"1px solid rgba(255,255,255,.055)", paddingLeft:32 }}>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".16em",
                               textTransform:"uppercase", color:"#ff4d6a", marginBottom:10 }}>
                    ✕ The Problem
                  </p>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10,
                               color:"rgba(255,255,255,.3)", lineHeight:1.8 }}>{f.problem}</p>
                </div>

                <div className="flex flex-col justify-between"
                     style={{ borderLeft:"1px solid rgba(255,255,255,.055)", paddingLeft:32 }}>
                  <div>
                    <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".16em",
                                 textTransform:"uppercase", color:f.accent, marginBottom:10 }}>
                      ✓ Verified
                    </p>
                    <div className="flex flex-col gap-2 mb-4">
                      {f.chains.map(c => (
                        <div key={c.name} className="flex items-center gap-2">
                          <span style={{ width:4, height:4, borderRadius:"50%",
                                         background:c.color, display:"inline-block" }}/>
                          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                                         color:"rgba(255,255,255,.3)" }}>{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setRoute("dashboard")}
                          className="flex items-center justify-between w-full cursor-pointer"
                          style={{ padding:"12px 16px", border:`1px solid ${f.accent}44`,
                                   background:"transparent", color:f.accent,
                                   fontFamily:"'IBM Plex Mono',monospace", fontSize:10,
                                   letterSpacing:".1em", textTransform:"uppercase",
                                   transition:"background .15s" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${f.accent}12`}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <span>{f.action}</span><span>→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

<br></br>
      {/* ── How It Works ─────────────────────────────── */}
      <section className="relative z-10 px-12 py-28"
               style={{ borderTop:"1px solid rgba(255,255,255,.05)" }}>
        <p className="flex items-center gap-3 mb-5"
           style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em",
                    textTransform:"uppercase", color:"#52b6ff" }}>
          <span style={{ display:"block", width:24, height:1, background:"#52b6ff" }}/>
          Process
        </p>
        <h2 className="mb-16"
            style={{ maxWidth:500, fontFamily:"'IBM Plex Serif',serif",
                     fontSize:"clamp(26px,4vw,48px)", fontWeight:300 }}>
          Three steps to full AI accountability
        </h2>
        <div className="grid" style={{ border:"1px solid rgba(255,255,255,.05)",
                                       gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))" }}>
          {[
            { n:"01", title:"Submit", icon:"↑", desc:"Register any AI entity via the dashboard. Credit profile, code bundle, or intent command — every field type supported, encrypted at source." },
            { n:"02", title:"Anchor", icon:"⬡", desc:"Every event is cryptographically signed and immutably anchored — on Hedera HCS, Avalanche, or both chains depending on the feature." },
            { n:"03", title:"Verify", icon:"✓", desc:"Anyone can verify any result independently. Open the explorer link. The proof exists with or without TrustBox — that's the whole point." },
          ].map((s, i) => (
            <div key={i} style={{ padding:40, borderRight:"1px solid rgba(255,255,255,.05)",
                                   transition:"background .2s" }}
                 onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#0b0f1a"}
                 onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".16em",
                            textTransform:"uppercase", color:"rgba(255,255,255,.16)", marginBottom:24 }}>
                {s.n} — {s.title}
              </div>
              <div className="flex items-center justify-center mb-6"
                   style={{ width:40, height:40, border:"1px solid rgba(255,255,255,.07)",
                            color:"#52b6ff", fontSize:18 }}>
                {s.icon}
              </div>
              <div style={{ fontSize:16, fontWeight:500, marginBottom:10 }}>{s.title}</div>
              <div style={{ fontSize:13, fontWeight:300, lineHeight:1.8,
                            color:"rgba(255,255,255,.32)" }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <br></br>

      {/* ── All Entity Types ──────────────────────────── */}
      <section className="relative z-10 px-12 py-28"
               style={{ borderTop:"1px solid rgba(255,255,255,.05)" }}>
        <p className="flex items-center gap-3 mb-5"
           style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em",
                    textTransform:"uppercase", color:"#52b6ff" }}>
          <span style={{ display:"block", width:24, height:1, background:"#52b6ff" }}/>
          Supported Entities
        </p>
        <h2 className="mb-16"
            style={{ maxWidth:540, fontFamily:"'IBM Plex Serif',serif",
                     fontSize:"clamp(26px,4vw,48px)", fontWeight:300 }}>
          Every AI entity type. One trust layer.
        </h2>
        <div className="grid" style={{ border:"1px solid rgba(255,255,255,.05)",
                                       gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))" }}>
          {(ENTITY_TYPES as any[]).map((et: any, i: number) => {
            const hex      = (ACCENT_HEX as any)[et.accentVar];
            const actColor = (ACTION_META as any)[et.action]?.color;
            return (
              <div key={et.id}
                   style={{ padding:32, borderRight:"1px solid rgba(255,255,255,.04)",
                            borderBottom:"1px solid rgba(255,255,255,.04)",
                            transition:"background .2s" }}
                   onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.018)"}
                   onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>

                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                                 letterSpacing:".18em", textTransform:"uppercase",
                                 color:"rgba(255,255,255,.15)" }}>
                    Module · {String(i + 1).padStart(2, "0")}
                  </span>
                  {et.badge && (
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7,
                                   letterSpacing:".1em", textTransform:"uppercase",
                                   color:et.badgeColor, border:`1px solid ${et.badgeColor}44`,
                                   padding:"1px 5px" }}>
                      {et.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center mb-5"
                     style={{ width:44, height:44, border:`1px solid ${hex}33`,
                              color:hex, fontSize:20 }}>
                  {et.icon}
                </div>

                <div style={{ fontSize:15, fontWeight:500, marginBottom:8 }}>{et.label}</div>
                <div style={{ fontSize:12, fontWeight:300, color:"rgba(255,255,255,.32)",
                              lineHeight:1.75, marginBottom:16 }}>{et.desc}</div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                                 letterSpacing:".14em", textTransform:"uppercase",
                                 color:actColor, border:`1px solid ${actColor}33`, padding:"3px 8px" }}>
                    {et.actionIcon} {et.actionLabel}
                  </span>
                  {et.chainTarget && (
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                                   color:"rgba(255,255,255,.18)" }}>
                      {et.chainTarget === "both"    ? "▲ + ℏ"
                        : et.chainTarget === "hedera"  ? "ℏ Hedera"
                        : "▲ Avalanche"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

<br></br>
      {/* ── Marketplace CTA ──────────────────────────── */}
      <section className="relative z-10 px-12 py-20"
               style={{ borderTop:"1px solid rgba(255,255,255,.05)",
                        background:"rgba(167,139,250,.025)" }}>
        <div className="flex items-center justify-between flex-wrap gap-8">
          <div>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em",
                        textTransform:"uppercase", color:"#a78bfa", marginBottom:10 }}>
              ⚿ Agent Marketplace · Avalanche · Phala TEE
            </p>
            <h2 style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:"clamp(22px,3.5vw,40px)",
                         fontWeight:300, marginBottom:12 }}>
              Register as a security agent.<br/>Earn verifiably.
            </h2>
            <p style={{ fontSize:13, fontWeight:300, color:"rgba(255,255,255,.32)",
                        lineHeight:1.8, maxWidth:460 }}>
              Stake AVAX, publish your TEE endpoint and encryption key. Clients submit encrypted
              code — you prove you ran the audit without them ever needing to trust you.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap shrink-0">
            <button className="btn-p" style={{ background:"#a78bfa", color:"#06080f" }}
                    onClick={() => setRoute("marketplace")}>
              Browse Marketplace →
            </button>
            <button className="btn-g" onClick={() => setRoute("marketplace")}>
              Register Agent
            </button>
          </div>
        </div>
      </section>

      <br></br><br></br>

      {/* ── Main CTA ─────────────────────────────────── */}
      <section className="relative z-10 px-12 py-28 flex flex-col items-center text-center overflow-hidden"
               style={{ borderTop:"1px solid rgba(255,255,255,.05)" }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background:"radial-gradient(ellipse at center, rgba(82,182,255,.05) 0%, transparent 65%)" }}/>
        <h2 className="mb-5"
            style={{ maxWidth:640, fontFamily:"'IBM Plex Serif',serif",
                     fontSize:"clamp(30px,5vw,58px)", fontWeight:300, lineHeight:1.1,
                     position:"relative", zIndex:1 }}>
          The age of unverified AI is over.
        </h2>
        <p className="mb-12"
           style={{ maxWidth:420, fontSize:14, fontWeight:300, color:"rgba(255,255,255,.32)",
                    lineHeight:1.8, position:"relative", zIndex:1 }}>
          Start with a credit score, a private audit, or an intent. No credit card.
          First verification in under 5 minutes.
        </p>
        <br></br>
        <br></br>
        <div className="flex gap-4 flex-wrap justify-center mb-10"
             style={{ position:"relative", zIndex:1 }}>
          <button className="btn-p" onClick={() => setRoute("dashboard")}>EXPLORE →</button>
          <button className="btn-g" onClick={() => setRoute("marketplace")}>Agent Marketplace</button>
        </div>
        <br></br>
        <div className="flex gap-6 flex-wrap justify-center" style={{ position:"relative", zIndex:1 }}>
          {[
            { icon:"ℏ", label:"Hedera HCS", color:"#8259EF" },
            { icon:"▲", label:"Avalanche",   color:"#E84142" },
            { icon:"⬡", label:"Chainlink",   color:"#375BD2" },
            { icon:"⚙", label:"Phala TEE",   color:"#00e5c0" },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-1"
                 style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:c.color }}>
              {c.icon} {c.label}
            </div>
          ))}
        </div>
      </section>

<br></br><br></br>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="relative z-10 px-12 py-9 flex items-center justify-between flex-wrap gap-5"
              style={{ borderTop:"1px solid rgba(255,255,255,.05)" }}>
        <div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:500,
                        letterSpacing:".08em", marginBottom:5 }}>
            Trust<span style={{ color:"#52b6ff" }}>Box</span>
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                        color:"rgba(255,255,255,.18)" }}>
            © {new Date().getFullYear()} TrustBox. All rights reserved.
          </div>
        </div>


        <div className="flex gap-6 flex-wrap">
          {["Privacy","Terms","Security","Status","Docs","Marketplace"].map(l => (
            <span key={l}
                  onClick={l === "Marketplace" ? () => setRoute("marketplace") : undefined}
                  style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".14em",
                           textTransform:"uppercase",
                           cursor:  l === "Marketplace" ? "pointer" : "default",
                           color:   l === "Marketplace" ? "#a78bfa" : "rgba(255,255,255,.2)",
                           transition:"color .15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color =
                    l === "Marketplace" ? "#c4b5fd" : "rgba(255,255,255,.5)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color =
                    l === "Marketplace" ? "#a78bfa" : "rgba(255,255,255,.2)"}>
              {l}
            </span>
          ))}
        </div>
      </footer>

    </div>
  );
}