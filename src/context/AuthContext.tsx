/* context/AuthContext.tsx — TrustBox
   Wraps useAuth hook into React context.
*/

import { createContext, useContext, type ReactNode } from "react";
import { useAuth, type AuthState, type AuthActions } from "../hooks/useAuth";

type AuthCtx = AuthState & AuthActions;

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be inside <AuthProvider>");
  return ctx;
}