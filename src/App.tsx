/* App.tsx — TrustBox */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import { AuthProvider }   from "./context/AuthContext";
import { NavBar }         from "./components/NavBar";

import Landing            from "./pages/Landing";
import Dashboard          from "./pages/Dashboard";
import Marketplace        from "./pages/Marketplace";
import { HistoryPage }    from "./pages/Historypage";

/* Every route gets the NavBar — Landing just has its own
   full-page hero below it (pt-0, the hero handles its own top padding). */
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"          element={<Layout><Landing /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/history"   element={<Layout><HistoryPage /></Layout>} />
            <Route path="/market"    element={<Layout><Marketplace /></Layout>} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </WalletProvider>
  );
}