/* LogoMark.jsx — TrustBox geometric SVG logo */

export default function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      <rect x="1"  y="1"  width="30" height="30" stroke="#52b6ff" strokeWidth="1"/>
      <rect x="7"  y="7"  width="18" height="18" stroke="#52b6ff" strokeWidth=".6" strokeDasharray="2 2"/>
      <rect x="13" y="13" width="6"  height="6"  fill="#52b6ff"/>
      <line x1="16" y1="1"  x2="16" y2="7"  stroke="#52b6ff" strokeWidth=".6"/>
      <line x1="16" y1="25" x2="16" y2="31" stroke="#52b6ff" strokeWidth=".6"/>
      <line x1="1"  y1="16" x2="7"  y2="16" stroke="#52b6ff" strokeWidth=".6"/>
      <line x1="25" y1="16" x2="31" y2="16" stroke="#52b6ff" strokeWidth=".6"/>
    </svg>
  );
}
