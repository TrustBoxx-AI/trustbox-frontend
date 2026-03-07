/* components/TrustBoxCanvas.tsx — TrustBox
   Wireframe 3-D box matching the design in fk2.png.

   Key design decisions:
   ─────────────────────────────────────────────────────────────
   • All 12 body edges drawn as glowing lines (not filled faces)
   • Faces rendered with very low alpha (0.04-0.07) for depth only
   • Lid is a separate 12-edge frame that lifts on open states
   • Painter's algorithm: back faces first, front faces last
   • All state + score reads via refs → RAF loop NEVER restarts
     so open/close animations are never interrupted
   • Canvas is 360×360 — matches right-panel width
   ─────────────────────────────────────────────────────────────
*/

import { useEffect, useRef } from "react";
import { ACCENT_HEX }        from "../constants";

interface Props {
  boxState:          string;
  processingAction?: string | null;
  score?:            any;
  entityAccentVar?:  string | null;
}

const STATE_CFG: Record<string, {
  speed:  number;
  open:   boolean;
  glow:   boolean;
  pulse:  boolean;
}> = {
  idle:                { speed:.004, open:false, glow:false, pulse:false },
  opening:             { speed:.010, open:true,  glow:false, pulse:false },
  open:                { speed:.005, open:true,  glow:false, pulse:true  },
  closing:             { speed:.009, open:false, glow:false, pulse:false },
  spinning:            { speed:.020, open:false, glow:false, pulse:true  },
  parsing:             { speed:.025, open:false, glow:true,  pulse:true  },
  "awaiting-approval": { speed:.007, open:true,  glow:true,  pulse:true  },
  processing:          { speed:.028, open:false, glow:true,  pulse:true  },
  executing:           { speed:.032, open:false, glow:true,  pulse:true  },
  anchoring:           { speed:.022, open:false, glow:true,  pulse:true  },
  scored:              { speed:.006, open:false, glow:true,  pulse:false },
  proved:              { speed:.005, open:false, glow:true,  pulse:false },
};

const BAND_LABEL: Record<number, string> = { 1:"POOR", 2:"FAIR", 3:"GOOD", 4:"EXCEL" };
const BAND_COLOR: Record<number, string> = {
  1:"#ff4d6a", 2:"#ffb347", 3:"#52b6ff", 4:"#00e5c0",
};

type Pt = { x: number; y: number };

function hexToRgb(hex: string) {
  const h = (hex || "").startsWith("#") ? hex : "#52b6ff";
  return {
    r: parseInt(h.slice(1,3), 16) || 82,
    g: parseInt(h.slice(3,5), 16) || 182,
    b: parseInt(h.slice(5,7), 16) || 255,
  };
}

/** Glowing wireframe edge: outer glow + bright core line */
function drawEdge(
  ctx: CanvasRenderingContext2D,
  a: Pt, b: Pt,
  r: number, g: number, b2: number,
  alpha: number,
  lw = 1.0,
) {
  ctx.lineCap = "round";
  // Outer glow pass
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = `rgba(${r},${g},${b2},${alpha * 0.22})`;
  ctx.lineWidth   = lw + 4;
  ctx.stroke();
  // Mid glow
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = `rgba(${r},${g},${b2},${alpha * 0.45})`;
  ctx.lineWidth   = lw + 1.5;
  ctx.stroke();
  // Core line
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = `rgba(${r},${g},${b2},${alpha})`;
  ctx.lineWidth   = lw;
  ctx.stroke();
}

/** Low-alpha face fill for depth perception */
function fillFace(
  ctx: CanvasRenderingContext2D,
  pts: Pt[],
  r: number, g: number, b2: number,
  alpha: number,
) {
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fillStyle = `rgba(${r},${g},${b2},${alpha})`;
  ctx.fill();
}

function drawBox(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  angle: number,
  lidT: number,       // 0 = closed, 1 = fully open
  stateName: string,
  accentHex: string,
  score: any,
) {
  const cfg = STATE_CFG[stateName] ?? STATE_CFG.idle;
  const cx  = W / 2;
  const cy  = H / 2 + 14;

  ctx.clearRect(0, 0, W, H);

  // Override colour by score band when in proved/scored/anchoring states
  const band = typeof score === "number" && score >= 1 && score <= 4 ? score : null;
  let   hex  = accentHex;
  if (band && (stateName === "proved" || stateName === "scored" || stateName === "anchoring")) {
    hex = BAND_COLOR[band];
  }
  const { r, g, b } = hexToRgb(hex);

  // Ambient radial glow behind the box
  if (cfg.glow || cfg.pulse) {
    const glowA   = cfg.glow
      ? (0.07 + 0.04 * Math.sin(Date.now() / 350))
      : (0.03 + 0.02 * Math.sin(Date.now() / 700));
    const grad    = ctx.createRadialGradient(cx, cy - 10, 5, cx, cy - 10, 180);
    grad.addColorStop(0, `rgba(${r},${g},${b},${glowA})`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Isometric projection ────────────────────────────────────
  const S   = 92;       // half-size
  const iso = 0.50;     // vertical compression
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  function pt(x: number, y: number, z: number): Pt {
    const rx =  x * cos - y * sin;
    const ry = (x * sin + y * cos) * iso - z * 0.86;
    return { x: cx + rx, y: cy + ry };
  }

  //  Corner layout:
  //  Bottom ring (z=-S):  0=back-L  1=back-R  2=front-R  3=front-L
  //  Top ring    (z=+S):  4=back-L  5=back-R  6=front-R  7=front-L
  const C: Pt[] = [
    pt(-S, -S, -S),   // 0
    pt( S, -S, -S),   // 1
    pt( S,  S, -S),   // 2
    pt(-S,  S, -S),   // 3
    pt(-S, -S,  S),   // 4
    pt( S, -S,  S),   // 5
    pt( S,  S,  S),   // 6
    pt(-S,  S,  S),   // 7
  ];

  // Lid — same XY footprint, shifted upward
  const liftY = lidT * 95;
  const LH    = S * 0.40;   // lid depth
  function lpt(x: number, y: number, z: number): Pt {
    const rx =  x * cos - y * sin;
    const ry = (x * sin + y * cos) * iso - (z + S + LH * 2) * 0.86 - liftY;
    return { x: cx + rx, y: cy + ry };
  }
  const L: Pt[] = [
    lpt(-S, -S, -LH),   // 0
    lpt( S, -S, -LH),   // 1
    lpt( S,  S, -LH),   // 2
    lpt(-S,  S, -LH),   // 3
    lpt(-S, -S,  LH),   // 4
    lpt( S, -S,  LH),   // 5
    lpt( S,  S,  LH),   // 6
    lpt(-S,  S,  LH),   // 7
  ];

  // Dynamic alpha based on state
  const t         = Date.now();
  const edgeAlpha = cfg.glow
    ? Math.min(0.92, 0.68 + 0.20 * Math.sin(t / 280))
    : cfg.pulse
    ? (0.50 + 0.14 * Math.sin(t / 650))
    : 0.38;

  const faceA = cfg.glow ? 0.08 : 0.04;
  const lw    = cfg.glow ? 1.3  : 1.0;

  // ── 1. Fill faces (back → front for depth) ─────────────────
  fillFace(ctx, [C[0], C[1], C[5], C[4]], r, g, b, faceA * 0.45);  // back
  fillFace(ctx, [C[0], C[3], C[7], C[4]], r, g, b, faceA * 0.55);  // left
  fillFace(ctx, [C[0], C[1], C[2], C[3]], r, g, b, faceA * 0.35);  // bottom
  fillFace(ctx, [C[1], C[2], C[6], C[5]], r, g, b, faceA * 0.75);  // right
  fillFace(ctx, [C[3], C[2], C[6], C[7]], r, g, b, faceA * 0.90);  // front
  fillFace(ctx, [C[4], C[5], C[6], C[7]], r, g, b, faceA * 1.10);  // top

  // ── 2. Draw all 12 body edges ───────────────────────────────
  const EDGES: [number, number][] = [
    // Bottom ring
    [0,1], [1,2], [2,3], [3,0],
    // Top ring
    [4,5], [5,6], [6,7], [7,4],
    // Verticals
    [0,4], [1,5], [2,6], [3,7],
  ];
  EDGES.forEach(([i, j]) => drawEdge(ctx, C[i], C[j], r, g, b, edgeAlpha, lw));

  // ── 3. Corner accent dots ───────────────────────────────────
  if (cfg.glow || cfg.pulse) {
    C.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${edgeAlpha * 0.85})`;
      ctx.fill();
    });
  }

  // ── 4. Draw lid (when open) ─────────────────────────────────
  if (lidT > 0.01) {
    const lidA  = edgeAlpha * 0.80;
    const lidLw = lw * 0.85;

    fillFace(ctx, [L[0], L[1], L[5], L[4]], r, g, b, faceA * 0.40);
    fillFace(ctx, [L[0], L[3], L[7], L[4]], r, g, b, faceA * 0.50);
    fillFace(ctx, [L[1], L[2], L[6], L[5]], r, g, b, faceA * 0.70);
    fillFace(ctx, [L[3], L[2], L[6], L[7]], r, g, b, faceA * 0.85);
    fillFace(ctx, [L[4], L[5], L[6], L[7]], r, g, b, faceA * 1.05);

    EDGES.forEach(([i, j]) => drawEdge(ctx, L[i], L[j], r, g, b, lidA, lidLw));

    if (cfg.glow || cfg.pulse) {
      L.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${lidA * 0.8})`;
        ctx.fill();
      });
    }
  }

  // ── 5. Interior overlay text ────────────────────────────────
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  const textY = cy + 4;

  if ((stateName === "scored" || stateName === "proved") && band !== null) {
    // Band label  e.g. GOOD
    const bc          = hexToRgb(BAND_COLOR[band]);
    ctx.font          = `600 19px 'IBM Plex Mono', monospace`;
    ctx.fillStyle     = BAND_COLOR[band];
    ctx.shadowColor   = BAND_COLOR[band];
    ctx.shadowBlur    = 8;
    ctx.fillText(BAND_LABEL[band], cx, textY - 8);
    ctx.shadowBlur    = 0;
    ctx.font          = `400 8px 'IBM Plex Mono', monospace`;
    ctx.fillStyle     = `rgba(${bc.r},${bc.g},${bc.b},0.50)`;
    ctx.fillText(`BAND ${band}`, cx, textY + 12);

  } else if ((stateName === "scored" || stateName === "proved") && typeof score === "number") {
    ctx.font          = `300 28px 'IBM Plex Mono', monospace`;
    ctx.fillStyle     = hex;
    ctx.shadowColor   = hex;
    ctx.shadowBlur    = 10;
    ctx.fillText(String(Math.round(score)), cx, textY - 4);
    ctx.shadowBlur    = 0;
    ctx.font          = `400 8px 'IBM Plex Mono', monospace`;
    ctx.fillStyle     = `rgba(${r},${g},${b},0.45)`;
    ctx.fillText("SCORE", cx, textY + 18);

  } else if (stateName === "proved") {
    // Non-score proved: checkmark
    ctx.font          = `300 34px 'IBM Plex Mono', monospace`;
    ctx.fillStyle     = hex;
    ctx.shadowColor   = hex;
    ctx.shadowBlur    = 12;
    ctx.fillText("✓", cx, textY);
    ctx.shadowBlur    = 0;

  } else if (stateName === "open" || stateName === "opening") {
    ctx.font      = `200 18px 'IBM Plex Mono', monospace`;
    ctx.fillStyle = `rgba(${r},${g},${b},0.18)`;
    ctx.fillText("+", cx, textY + 4);

  } else if (["processing","executing","anchoring","parsing"].includes(stateName)) {
    const dots    = "· ".repeat(1 + (Math.floor(t / 450) % 3)).trim();
    ctx.font      = `400 13px 'IBM Plex Mono', monospace`;
    ctx.fillStyle = `rgba(${r},${g},${b},0.40)`;
    ctx.fillText(dots, cx, textY);
  }
}

export default function TrustBoxCanvas({ boxState, score, entityAccentVar }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const stateRef   = useRef(boxState);
  const scoreRef   = useRef<any>(score);

  // Keep refs current every render — never triggers useEffect
  stateRef.current = boxState;
  scoreRef.current = score;

  const accentHex = entityAccentVar
    ? ((ACCENT_HEX as any)[entityAccentVar] ?? "#52b6ff")
    : "#52b6ff";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const W = canvas.width  = 360;
    const H = canvas.height = 360;

    let angle    = 0.45;   // start at a good isometric angle
    let lidAngle = 0;

    function tick() {
      const cfg = STATE_CFG[stateRef.current] ?? STATE_CFG.idle;
      angle += cfg.speed;

      // Smooth lid animation
      if (cfg.open) lidAngle = Math.min(lidAngle + 0.038, 1);
      else          lidAngle = Math.max(lidAngle - 0.060, 0);

      drawBox(ctx, W, H, angle, lidAngle, stateRef.current, accentHex, scoreRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [accentHex]); // only restarts when accent colour changes

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={360}
      style={{ display: "block", margin: "0 auto", maxWidth: "100%" }}
    />
  );
}