/* Nav.jsx — TrustBox top navigation bar */

import LogoMark from "./LogoMark";

export default function Nav({ route, setRoute }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-10 h-16 backdrop-blur-xl border-b border-white/[0.055]"
      style={{ zIndex: 100, background: "rgba(6,8,15,0.92)" }}
    >
      <button
        onClick={() => setRoute("landing")}
        className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer"
      >
        <LogoMark />
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 500, letterSpacing: ".08em", color: "#e8eaf0" }}>
          Trust<span style={{ color: "#52b6ff" }}>Box</span>
        </span>
      </button>

      <ul className="flex gap-7 list-none">
        {[["Home","landing"],["Dashboard","dashboard"],["Docs","landing"],["Status","landing"]].map(([label, route_]) => (
          <li key={label}>
            <button className="nav-link" onClick={() => setRoute(route_)}>{label}</button>
          </li>
        ))}
      </ul>

      <button className="btn-p" onClick={() => setRoute("dashboard")}>
        {route === "dashboard" ? "My Box" : "Start for Free"}
      </button>
    </nav>
  );
}
