/* App.jsx — TrustBox root
   Imports global CSS, mounts Nav, routes between pages.
*/

import { useState } from "react";
import Nav       from "./components/Nav";
import Landing   from "./pages/Landing";
import Dashboard from "./pages/Dashboard";

import "./styles/global.css";
import "./styles/components.css";

export default function App() {
  const [route, setRoute] = useState("landing");

  return (
    <>
      <Nav route={route} setRoute={setRoute}/>
      {route === "landing"   && <Landing   setRoute={setRoute}/>}
      {route === "dashboard" && <Dashboard setRoute={setRoute}/>}
    </>
  );
}
