/* TrustBoxCanvas.jsx — TrustBox
   3-D wireframe cube rendered on an HTML canvas.

   Props:
     boxState        "idle"|"opening"|"open"|"closing"|"spinning"|"processing"|"scored"
     processingAction  "verify"|"audit"|"scan"|null
     score           number|null  — trust score (stays on box once set)
     entityAccentVar  CSS var name e.g. "--c-blue"
*/

import { useRef, useEffect, useMemo } from "react";
import { ACTION_META, ACCENT_HEX, CODE_SNIPPETS } from "../constants";

export default function TrustBoxCanvas({ boxState, processingAction, score, entityAccentVar }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  /* mutable draw-loop state — lives in a ref to avoid re-render churn */
  const S = useRef({
    angleX: 0.3, angleY: 0.3,
    spinSpeed: 0, targetSpeed: 0,
    lidT: 0,        /* 0 = closed, 1 = fully open */
    scoreAlpha: 0,  /* ramps to 1 when scored, resets to 0 when score=null */
    glowPulse: 0,
    codeLines: [],
  }).current;

  /* derive accent colour from active action or selected entity */
  const accentColor = useMemo(
    () => processingAction ? ACTION_META[processingAction]?.color : (ACCENT_HEX[entityAccentVar] || "#52b6ff"),
    [processingAction, entityAccentVar]
  );

  /* seed floating code lines once on mount */
  useEffect(() => {
    S.codeLines = CODE_SNIPPETS.map((s, i) => ({
      text:  s.text,
      col:   s.col,
      x:    (Math.random() - .5) * 130,
      y:    -110 + (i / (CODE_SNIPPETS.length - 1)) * 220,
      z:    (Math.random() - .5) * 80,
      vy:   (Math.random() - .5) * 0.12,
      alpha: 0.55 + Math.random() * 0.3,
    }));
  }, []);

  /* update spin target when boxState changes */
  useEffect(() => {
    const targets = { idle: 0, opening: 0, open: 0, closing: 0, spinning: .016, processing: .034, scored: .016 };
    S.targetSpeed = targets[boxState] ?? 0;
  }, [boxState]);

  /* main draw loop — re-created when colour or state changes */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width  = 400;
    const H = canvas.height = 400;
    const cx = W / 2, cy = H / 2;
    const SZ = 98; /* half-side of cube */

    /* ── geometry ───────────────────────────────────── */
    const VERTS = [
      [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1], /* 0-3 back  */
      [-1,-1, 1],[1,-1, 1],[1,1, 1],[-1,1, 1], /* 4-7 front */
    ].map(v => v.map(x => x * SZ));

    const LID_IDX   = [0,1,5,4];
    const BODY_EDGES = [[3,2],[2,6],[6,7],[7,3],[0,3],[1,2],[5,6],[4,7]];
    const LID_EDGES  = [[0,1],[1,5],[5,4],[4,0],[0,5],[1,4]];

    /* ── math helpers ───────────────────────────────── */
    const rotX = (v,a) => [v[0], v[1]*Math.cos(a)-v[2]*Math.sin(a), v[1]*Math.sin(a)+v[2]*Math.cos(a)];
    const rotY = (v,a) => [v[0]*Math.cos(a)+v[2]*Math.sin(a), v[1], -v[0]*Math.sin(a)+v[2]*Math.cos(a)];
    const proj  = v => { const fov=480, z=fov/(fov+v[2]+190); return [cx+v[0]*z, cy+v[1]*z, z]; };
    const xform = verts => verts.map(v => proj(rotY(rotX(v, S.angleX), S.angleY)));
    const hex2  = n => Math.round(n).toString(16).padStart(2,"0");

    let frame = 0;

    const draw = () => {
      frame++;
      ctx.clearRect(0,0,W,H);

      /* ease rotation */
      S.spinSpeed += (S.targetSpeed - S.spinSpeed) * .055;
      S.angleY    += S.spinSpeed;
      S.angleX    += S.spinSpeed * .4;

      /* ease lid */
      if (boxState === "opening") {
        S.lidT = Math.min(S.lidT + .022, 1);
      } else if (["closing","spinning","processing","scored"].includes(boxState)) {
        S.lidT = Math.max(S.lidT - .028, 0);
      }

      /* score alpha — resets when score is null, ramps up when scored */
      if (score == null) {
        S.scoreAlpha = 0;
      } else if (boxState === "scored" || S.scoreAlpha >= 0.01) {
        S.scoreAlpha = Math.min(S.scoreAlpha + .04, 1);
      }

      /* glow pulse */
      S.glowPulse = Math.sin(frame * .05) * .5 + .5;

      const col = accentColor;

      /* ── background glow ─────────────────────────── */
      const glowA = boxState === "processing" ? .1 + S.glowPulse * .09
                  : boxState === "scored"     ? .08 + S.glowPulse * .05
                  : .03 + S.glowPulse * .015;
      const gg = ctx.createRadialGradient(cx,cy,0,cx,cy,SZ*1.9);
      gg.addColorStop(0, col + hex2(glowA*255));
      gg.addColorStop(1, "transparent");
      ctx.fillStyle = gg;
      ctx.fillRect(0,0,W,H);

      /* ── floating code lines ─────────────────────── */
      if (!["idle","opening","open"].includes(boxState)) {
        ctx.save();
        S.codeLines.forEach(cl => {
          cl.y += cl.vy;
          if (cl.y >  115) cl.y = -115;
          if (cl.y < -115) cl.y =  115;

          let v3 = rotX([cl.x, cl.y, cl.z], S.angleX);
          v3 = rotY(v3, S.angleY);
          const pp = proj(v3);
          const depthA = Math.max(0, Math.min(pp[2] * 1.1 - 0.05, 1));
          const a = cl.alpha * depthA;
          if (a < 0.04) return;

          const fs = Math.round(8 * pp[2] + 4);
          ctx.font = `${fs}px 'IBM Plex Mono', monospace`;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";

          const tw = ctx.measureText(cl.text).width;
          ctx.fillStyle = `rgba(6,8,15,${a * 0.55})`;
          ctx.fillRect(pp[0] - 2, pp[1] - fs * 0.7, tw + 4, fs * 1.4);
          ctx.fillStyle = cl.col + hex2(a * 255);
          ctx.fillText(cl.text, pp[0], pp[1]);
        });
        ctx.restore();
      }

      /* ── transform vertices ─────────────────────── */
      const tv = xform(VERTS);

      /* ── lid vertices (lifted) ──────────────────── */
      const lidOffY = S.lidT * SZ * 1.45;
      const tlv = xform(VERTS.map((v,i) => LID_IDX.includes(i) ? [v[0], v[1]-lidOffY, v[2]] : v));

      /* ── body faces ─────────────────────────────── */
      const faceA = boxState === "processing" ? .06 : .025;
      [[3,2,6,7],[0,3,7,4],[1,2,6,5]].forEach(face => {
        ctx.beginPath();
        face.forEach((fi,k) => k===0 ? ctx.moveTo(tv[fi][0],tv[fi][1]) : ctx.lineTo(tv[fi][0],tv[fi][1]));
        ctx.closePath();
        ctx.fillStyle = col + hex2(faceA * 255);
        ctx.fill();
      });

      /* ── body edges ─────────────────────────────── */
      ctx.shadowColor = col;
      ctx.shadowBlur  = boxState === "processing" ? 8 : 3;
      BODY_EDGES.forEach(([a,b]) => {
        const dep = (tv[a][2]+tv[b][2]) * .5;
        ctx.beginPath(); ctx.moveTo(tv[a][0],tv[a][1]); ctx.lineTo(tv[b][0],tv[b][1]);
        ctx.strokeStyle = col + hex2(.7 * dep * 255);
        ctx.lineWidth = 1.2; ctx.stroke();
      });

      /* ── lid face ───────────────────────────────── */
      if (S.lidT < .99) {
        ctx.beginPath();
        LID_IDX.forEach((vi,k) => k===0 ? ctx.moveTo(tlv[vi][0],tlv[vi][1]) : ctx.lineTo(tlv[vi][0],tlv[vi][1]));
        ctx.closePath();
        ctx.fillStyle = col + hex2((faceA + .025) * 255);
        ctx.fill();
      }

      /* ── lid edges ──────────────────────────────── */
      LID_EDGES.forEach(([a,b]) => {
        const dep = (tlv[a][2]+tlv[b][2]) * .5;
        ctx.beginPath(); ctx.moveTo(tlv[a][0],tlv[a][1]); ctx.lineTo(tlv[b][0],tlv[b][1]);
        ctx.strokeStyle = col + hex2(.65 * dep * 255);
        ctx.lineWidth = 1; ctx.stroke();
      });
      ctx.shadowBlur = 0;

      /* ── corner dots ────────────────────────────── */
      [...tv, ...LID_IDX.map(i => tlv[i])].forEach(p => {
        ctx.beginPath(); ctx.arc(p[0],p[1],2*p[2],0,Math.PI*2);
        ctx.fillStyle = col + hex2(.85 * p[2] * 255);
        ctx.fill();
      });

      /* ── cavity glow (when open) ────────────────── */
      if (S.lidT > .2) {
        const topC = proj(rotY(rotX([0,-SZ,0], S.angleX), S.angleY));
        const gc = ctx.createRadialGradient(topC[0],topC[1],0,topC[0],topC[1],SZ);
        gc.addColorStop(0, col + hex2(S.lidT * .12 * 255));
        gc.addColorStop(1, "transparent");
        ctx.fillStyle = gc; ctx.fillRect(0,0,W,H);
      }

      /* ── processing orbit ring ──────────────────── */
      if (boxState === "processing") {
        const rr   = SZ * 1.52;
        const prog = (frame % 100) / 100;
        ctx.beginPath(); ctx.arc(cx,cy,rr,-Math.PI/2,-Math.PI/2+prog*Math.PI*2);
        ctx.strokeStyle = col+"55"; ctx.lineWidth = 1.5; ctx.stroke();
        const tipA = -Math.PI/2 + prog * Math.PI * 2;
        ctx.beginPath(); ctx.arc(cx+Math.cos(tipA)*rr, cy+Math.sin(tipA)*rr, 3, 0, Math.PI*2);
        ctx.fillStyle = col; ctx.fill();
      }

      /* ── score overlay on front face ────────────── */
      if (S.scoreAlpha > .01 && score != null) {
        const fc = proj(rotY(rotX([0,0,SZ], S.angleX), S.angleY));
        const sa = S.scoreAlpha;
        const rr = 34 * fc[2];

        ctx.beginPath(); ctx.arc(fc[0],fc[1],rr,0,Math.PI*2);
        ctx.fillStyle = `rgba(6,8,15,${sa*.88})`; ctx.fill();

        ctx.beginPath(); ctx.arc(fc[0],fc[1],rr,0,Math.PI*2);
        ctx.strokeStyle = col + hex2(sa*.5*255); ctx.lineWidth = 1.2; ctx.stroke();

        ctx.beginPath(); ctx.arc(fc[0],fc[1],rr-3,-Math.PI/2,-Math.PI/2+(score/100)*Math.PI*2);
        ctx.strokeStyle = col + hex2(sa*255); ctx.lineWidth = 2.5; ctx.stroke();

        ctx.fillStyle = `rgba(232,234,240,${sa})`;
        ctx.font = `500 ${Math.round(16*fc[2])}px 'IBM Plex Mono'`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(score), fc[0], fc[1]);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [boxState, accentColor, score]);

  return (
    <canvas
      ref={canvasRef}
      className="block"
      style={{ filter: boxState === "processing" ? "brightness(1.18)" : "brightness(1)", transition: "filter .5s" }}
    />
  );
}
