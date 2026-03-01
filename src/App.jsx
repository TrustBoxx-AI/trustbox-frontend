/* App.jsx — TrustBox root router */

import { useState }      from "react";
import { WalletProvider } from "./context/WalletContext";
import Nav                from "./components/Nav";
import Landing            from "./pages/Landing";
import Dashboard          from "./pages/Dashboard";
import Marketplace        from "./pages/Marketplace";
import "./styles/global.css";
import "./styles/components.css";

export default function App() {
  const [route, setRoute] = useState("landing");

  return (
    <WalletProvider>
      <Nav route={route} setRoute={setRoute}/>
      {route === "landing"     && <Landing     setRoute={setRoute}/>}
      {route === "dashboard"   && <Dashboard   setRoute={setRoute}/>}
      {route === "marketplace" && <Marketplace setRoute={setRoute}/>}
    </WalletProvider>
  );
}
