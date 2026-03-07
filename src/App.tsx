/* App.tsx — TrustBox Frontend */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider }  from "./context/WalletContext";
import { AuthProvider }    from "./context/AuthContext";
import { EntityProvider }  from "./context/EntityContext";
import { NavBar }          from "./components/NavBar";

import Landing             from "./pages/Landing";
import Dashboard           from "./pages/Dashboard";
import Marketplace         from "./pages/Marketplace";
import { HistoryPage }     from "./pages/Historypage";

export default function App() {
  return (
    <WalletProvider>
      <AuthProvider>
        <EntityProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"          element={<><NavBar /><Landing /></>} />
              <Route path="/dashboard" element={<><NavBar /><Dashboard /></>} />
              <Route path="/history"   element={<><NavBar /><HistoryPage /></>} />
              <Route path="/market"    element={<><NavBar /><Marketplace /></>} />
              <Route path="*"          element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </EntityProvider>
      </AuthProvider>
    </WalletProvider>
  );
}