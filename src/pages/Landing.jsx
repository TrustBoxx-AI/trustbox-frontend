/* Landing.jsx — TrustBox marketing / landing page */

import Ticker      from "../components/Ticker";
import { ENTITY_TYPES, ACTION_META, ACCENT_HEX } from "../constants";

export default function Landing({ setRoute }) {
  return (
    <div className="grid-bg">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col justify-center px-12 pt-28 pb-20 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
             style={{ background:"radial-gradient(circle, rgba(82,182,255,0.055) 0%, transparent 70%)" }}/>

        <p className="flex items-center gap-3 mb-7"
           style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".24em", textTransform:"uppercase", color:"#52b6ff", animation:"fadeUp .6s ease both .2s", opacity:0 }}>
          <span className="block w-8 h-px bg-[#52b6ff]"/>
          AI Provability Infrastructure
        </p>

        <h1 className="max-w-[760px] mb-6"
            style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:"clamp(40px,6vw,78px)", fontWeight:300, lineHeight:1.07, animation:"fadeUp .7s ease both .35s", opacity:0 }}>
          Trust is not assumed.<br/>
          <em className="italic" style={{ color:"#52b6ff" }}>It is proven.</em>
        </h1>

        <p className="max-w-[460px] mb-12"
           style={{ fontSize:15, fontWeight:300, lineHeight:1.75, color:"rgba(255,255,255,.38)", animation:"fadeUp .7s ease both .5s", opacity:0 }}>
          TrustBox is the transparency layer for AI systems. Log, verify, and audit every agent, workflow, and interaction — immutably and in real time.
        </p>

        <div className="flex gap-4 flex-wrap" style={{ animation:"fadeUp .7s ease both .65s", opacity:0 }}>
          <button className="btn-p" onClick={() => setRoute("dashboard")}>Start for Free →</button>
          <button className="btn-g">How It Works</button>
        </div>

        {/* stats strip */}
        <div className="flex flex-wrap mt-20 border-t border-white/[0.055] pt-8" style={{ animation:"fadeUp .7s ease both .85s", opacity:0 }}>
          {[["12.4M+","Events logged"],["99.99%","Uptime SLA"],["< 8ms","Write latency"],["SOC 2","Type II"]].map(([n,l]) => (
            <div key={l} className="pr-10 border-r border-white/[0.055] mr-10 mb-4 last:border-none">
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, fontWeight:500, letterSpacing:"-.02em", marginBottom:4 }}>{n}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.2)" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <Ticker/>

      {/* ── How it works ── */}
      <section className="relative z-10 px-12 py-28 border-t border-white/[0.05]">
        <p className="flex items-center gap-3 mb-5"
           style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em", textTransform:"uppercase", color:"#52b6ff" }}>
          <span className="block w-6 h-px bg-[#52b6ff]"/>Process
        </p>
        <h2 className="max-w-[500px] mb-16"
            style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:"clamp(26px,4vw,48px)", fontWeight:300 }}>
          Three steps to full AI accountability
        </h2>
        <div className="grid border border-white/[0.05]" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))" }}>
          {[
            { n:"01", title:"Submit", icon:"↑", desc:"Register any AI entity through the dashboard or REST API in minutes."         },
            { n:"02", title:"Anchor", icon:"⬡", desc:"Every event is cryptographically signed and immutably anchored on-chain."     },
            { n:"03", title:"Verify", icon:"✓", desc:"Anyone can independently verify any claim. Zero-trust. Proof on demand."      },
          ].map((s,i) => (
            <div key={i} className="p-10 border-r border-white/[0.05] last:border-none transition-colors hover:bg-[#0b0f1a]">
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".16em", textTransform:"uppercase", color:"rgba(255,255,255,.16)", marginBottom:24 }}>{s.n} — {s.title}</div>
              <div className="w-10 h-10 flex items-center justify-center mb-6 text-lg" style={{ border:"1px solid rgba(255,255,255,.07)", color:"#52b6ff" }}>{s.icon}</div>
              <div style={{ fontSize:16, fontWeight:500, marginBottom:10 }}>{s.title}</div>
              <div style={{ fontSize:13, fontWeight:300, lineHeight:1.75, color:"rgba(255,255,255,.32)" }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Entity types ── */}
      <section className="relative z-10 px-12 py-28 border-t border-white/[0.05]">
        <p className="flex items-center gap-3 mb-5"
           style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em", textTransform:"uppercase", color:"#52b6ff" }}>
          <span className="block w-6 h-px bg-[#52b6ff]"/>Supported Entities
        </p>
        <h2 className="max-w-[540px] mb-16"
            style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:"clamp(26px,4vw,48px)", fontWeight:300 }}>
          Every AI entity type. One trust layer.
        </h2>
        <div className="grid border border-white/[0.05]" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))" }}>
          {ENTITY_TYPES.map((et,i) => {
            const hex = ACCENT_HEX[et.accentVar];
            const actColor = ACTION_META[et.action]?.color;
            return (
              <div key={et.id} className="p-10 border-r border-b border-white/[0.04] last:border-r-0 transition-colors hover:bg-[rgba(82,182,255,.015)]">
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.15)", marginBottom:16 }}>Module · {String(i+1).padStart(2,"0")}</div>
                <div className="w-11 h-11 flex items-center justify-center mb-5 text-lg" style={{ border:`1px solid ${hex}33`, color:hex }}>{et.icon}</div>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:8 }}>{et.label}</div>
                <div style={{ fontSize:12, fontWeight:300, color:"rgba(255,255,255,.32)", lineHeight:1.75, marginBottom:16 }}>{et.desc}</div>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".14em", textTransform:"uppercase", color:actColor, border:`1px solid ${actColor}33`, padding:"3px 8px" }}>
                  {et.actionIcon} {et.actionLabel}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-12 py-28 border-t border-white/[0.05] flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
             style={{ background:"radial-gradient(ellipse at center, rgba(82,182,255,.05) 0%, transparent 65%)" }}/>
        <h2 className="max-w-[580px] mb-5"
            style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:"clamp(30px,5vw,58px)", fontWeight:300, lineHeight:1.1 }}>
          The age of unverified AI is over.
        </h2>
        <p className="max-w-[380px] mb-12"
           style={{ fontSize:14, fontWeight:300, color:"rgba(255,255,255,.32)", lineHeight:1.75 }}>
          Start logging your first AI event in under 5 minutes. No credit card required.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button className="btn-p" onClick={() => setRoute("dashboard")}>Start for Free →</button>
          <button className="btn-g">Read the Docs</button>
        </div>
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.15)", letterSpacing:".12em", marginTop:20 }}>
          SOC 2 Type II · GDPR · 99.99% SLA
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.05] px-12 py-9 flex items-center justify-between flex-wrap gap-5">
        <div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:500, letterSpacing:".08em", marginBottom:5 }}>
            Trust<span style={{ color:"#52b6ff" }}>Box</span>
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.18)" }}>© 2026 TrustBox Inc. All rights reserved.</div>
        </div>
        <div className="flex gap-6">
          {["Privacy","Terms","Security","Status","Docs"].map(l => (
            <span key={l} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".14em", textTransform:"uppercase", color:"rgba(255,255,255,.2)", cursor:"pointer" }}
                  className="hover:text-white/50 transition-colors">{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
