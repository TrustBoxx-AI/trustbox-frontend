/* main.jsx — TrustBox entry point */

import { StrictMode }  from "react";
import { createRoot }  from "react-dom/client";
import App             from "./App";

createRoot(document.getElementById("root")).render(
 <WalletProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</WalletProvider>
);
