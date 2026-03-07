/* components/TrustBoxCanvas.tsx — TrustBox
   Uses refs for all per-frame reads — score/state changes never
   restart the RAF loop, so open/close animations are never interrupted.
*/

import { useEffect, useRef } from "react";
import { ACCENT_HEX }        from "../constants";

interface Props {
  boxState:          string;
  processingAction?: string | null;
  score?:            any;
  entityAccentVar?:  string | null;
}

const STATE_CFG: Record<string, { speed: number; open: boolean; glow: boolean }> = {
  idle:                { speed:.003, open:false, glow:false },
  opening:             { speed:.008, open:true,  glow:false },
  open:                { speed:.004, open:true,  glow:false },
  closing:             { speed:.007, open:false, glow:false },
  spinning:            { speed:.018, open:false, glow:false },
  parsing:             { speed:.022, open:false, glow:true  },
  "awaiting-approval": { speed:.006, open:true,  glow:true  },
  processing:          { speed:.025, open:false, glow:true  },
  executing:           { speed:.030, open:false, glow:true  },
  anchoring:           { speed:.020, open:false, glow:true  },
  scored:              { speed:.005, open:false, glow:true  },
  proved:              { speed:.004, open:false, glow:true  },
};

const BAND_LABEL: Record<number, string> = {
  1: "POOR",
  2: "FAIR",
  3: "GOOD",
  4: "EXCEL",
};

const BAND_COLOR: Record<number, string> = {
  1: "#ff4d6a",
  2: "#ffb347",
  3: "#52b6ff",
  4: "#00e5c0",
};

function hexToRgb(hex: string) {
  const safe = hex.startsWith("#") ? hex : "#52b6ff";
  return {
    r: parseInt(safe.slice(1, 3), 16) || 82,
    g: parseInt(safe.slice(3, 5), 16) || 182,
    b: parseInt(safe.slice(5, 7), 16) || 255,
  };
}

function drawGlow(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, g: number, b: number) {
  const pulse = 0.04 + 0.03 * Math.sin(Date.now() / 400);
  const grad  = ctx.createRadialGradient(cx, cy, 20, cx, cy, 120);
  grad.addColorStop(0, `rgba(${r},${g},${b},${pulse})`);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cx * 2, cy * 2);
}

type Point = { x: number; y: number };

function drawFace(
  ctx: CanvasRenderingContext2D,
  corners: Point[], indices: number[],
  r: number, g: number, b: number,
  light: number, alpha: number,
) {
  ctx.beginPath();
  indices.forEach((i, j) => {
    const p = corners[i];
    j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fillStyle   = `rgba(${Math.round(r*light)},${Math.round(g*light)},${Math.round(b*light)},${alpha*0.18})`;
  ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
  ctx.lineWidth   = 1;
  ctx.fill();
  ctx.stroke();
}

function drawBox(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  ang: number, lid: number,
  stateName: string,
  accentHex: string,
  score: any,
) {
  const cfg = STATE_CFG[stateName] ?? STATE_CFG.idle;
  let   rgb = hexToRgb(accentHex);

  // For score action, override colour by band
  const band = typeof score === "number" && score >= 1 && score <= 4 ? score : null;
  if (band && (stateName === "proved" || stateName === "scored" || stateName === "anchoring")) {
    rgb = hexToRgb(BAND_COLOR[band]);
  }
  const { r, g, b } = rgb;

  const cx = W / 2;
  const cy = H / 2;
  ctx.clearRect(0, 0, W, H);
  if (cfg.glow) drawGlow(ctx, cx, cy, r, g, b);

  const s   = 70;
  const iso = 0.5;
  const cos = Math.cos(ang);
  const sin = Math.sin(ang);

  function pt(x: number, y: number, z: number): Point {
    const rx =  x * cos - y * sin;
    const ry = (x * sin + y * cos) * iso - z * 0.86;
    return { x: cx + rx, y: cy + ry + 20 };
  }

  const corners: Point[] = [
    pt(-s,-s,-s), pt(s,-s,-s), pt(s,s,-s), pt(-s,s,-s),
    pt(-s,-s, s), pt(s,-s, s), pt(s,s, s), pt(-s,s, s),
  ];

  const alpha = cfg.glow ? 0.7 : 0.5;
  drawFace(ctx, corners, [3,2,1,0], r,g,b, 0.6, alpha);
  drawFace(ctx, corners, [1,2,6,5], r,g,b, 0.8, alpha);
  drawFace(ctx, corners, [4,5,6,7], r,g,b, 1.0, alpha);

  if (lid > 0) {
    const lidH  = s * 0.5;
    const liftY = lid * 50;
    function lpt(x: number, y: number, z: number): Point {
      const rx =  x * cos - y * sin;
      const ry = (x * sin + y * cos) * iso - (z + lidH * 2) * 0.86 - liftY;
      return { x: cx + rx, y: cy + ry + 20 };
    }
    const lc: Point[] = [
      lpt(-s,-s,-lidH), lpt(s,-s,-lidH), lpt(s,s,-lidH), lpt(-s,s,-lidH),
      lpt(-s,-s, lidH), lpt(s,-s, lidH), lpt(s,s, lidH), lpt(-s,s, lidH),
    ];
    drawFace(ctx, lc, [3,2,1,0], r,g,b, 0.5, 0.55);
    drawFace(ctx, lc, [1,2,6,5], r,g,b, 0.7, 0.55);
    drawFace(ctx, lc, [4,5,6,7], r,g,b, 0.9, 0.55);
  }

  // Score band overlay
  if ((stateName === "scored" || stateName === "proved") && band !== null) {
    const bandColor = BAND_COLOR[band];
    const { r: br, g: bg, b: bb } = hexToRgb(bandColor);
    ctx.font      = "bold 22px 'IBM Plex Mono', monospace";
    ctx.fillStyle = bandColor;
    ctx.textAlign = "center";
    ctx.fillText(BAND_LABEL[band], cx, cy + 8);
    ctx.font      = "400 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = `rgba(${br},${bg},${bb},0.5)`;
    ctx.fillText(`BAND ${band}`, cx, cy + 24);
  } else if ((stateName === "scored" || stateName === "proved") && score !== null && score !== undefined && typeof score === "number") {
    // Numeric score (0-100 range, e.g. audit score)
    ctx.font      = "300 28px 'IBM Plex Mono', monospace";
    ctx.fillStyle = accentHex;
    ctx.textAlign = "center";
    ctx.fillText(String(Math.round(score)), cx, cy + 10);
    ctx.font      = "400 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
    ctx.fillText("SCORE", cx, cy + 26);
  } else if (stateName === "proved") {
    // Non-score actions (verify, execute, audit) — show checkmark
    ctx.font      = "300 32px 'IBM Plex Mono', monospace";
    ctx.fillStyle = accentHex;
    ctx.textAlign = "center";
    ctx.fillText("✓", cx, cy + 14);
  }
}

export default function TrustBoxCanvas({ boxState, score, entityAccentVar }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const stateRef   = useRef(boxState);
  const scoreRef   = useRef<any>(score);

  // Keep refs in sync on every render — never trigger effect reruns
  stateRef.current = boxState;
  scoreRef.current = score;

  const accentHex = entityAccentVar
    ? (ACCENT_HEX[entityAccentVar as keyof typeof ACCENT_HEX] ?? "#52b6ff")
    : "#52b6ff";

  // Effect only depends on accentHex — colour changes restart with fresh canvas.
  // boxState and score are read via refs so the loop NEVER restarts mid-animation.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const W = canvas.width  = 280;
    const H = canvas.height = 280;

    let angle    = 0;
    let lidAngle = 0;

    function tick() {
      const cfg = STATE_CFG[stateRef.current] ?? STATE_CFG.idle;
      angle += cfg.speed;
      if (cfg.open) lidAngle = Math.min(lidAngle + 0.04, 1);
      else          lidAngle = Math.max(lidAngle - 0.06, 0);
      drawBox(ctx, W, H, angle, lidAngle, stateRef.current, accentHex, scoreRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [accentHex]); // ← score removed; lid/state changes are read via refs

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={280}
      style={{ display: "block", margin: "0 auto" }}
    />
  );
}