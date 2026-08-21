const fs = require('fs');

const content = `import { useState, useEffect } from "react";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import UserDashboard from "@/components/dashboards/UserDashboard";

// Define apiFetch at the top since it's used in page.tsx
const apiFetch = async (input: string | URL | globalThis.Request, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const isApi = url.startsWith("/api");
  if (!isApi) return fetch(input, init);
  const token = typeof window !== "undefined" ? localStorage.getItem("jirra_token") : null;
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", \`Bearer \${token}\`);
  return fetch(input, { ...init, headers });
};

export default function Home() {
  const [user, setUser] = useState<{id:number;name:string;email:string;role:string}|null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("admin@jirra.local");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const loadUser = async () => {
    try {
      const response = await apiFetch("/api/auth/me");
      if (response.ok) {
        setUser(await response.json());
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    void loadUser();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!response.ok) throw new Error();
      void loadUser();
    } catch {
      setLoginError("Invalid credentials");
      setTimeout(() => setLoginError(""), 3000);
    }
  };

  if (authLoading) {
    return (
      <main className="login-page">
        <div className="login-box">
          <div className="logo" style={{ marginBottom: "20px" }}>JIRRA</div>
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            <div className="spinner"></div>
            <p style={{ marginTop: "15px" }}>Loading session...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="login-page">
        <div className="login-box">
          <div className="logo">JIRRA</div>
          <p>Sign in to your workspace</p>
          <input
            autoFocus
            type="email"
            placeholder="Email address"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {loginError && <div className="error-message">{loginError}</div>}
          <button onClick={handleLogin}>Continue to workspace</button>
          <div className="demo-credentials">
            <strong>Demo Accounts:</strong><br />
            admin@jirra.local (Super Admin)<br />
            manager@jirra.local (Project Manager)<br />
            user@jirra.local (Developer)<br />
            <small>Password for all: password123</small>
          </div>
        </div>
      </main>
    );
  }

  if (user.role === "super_admin") return <AdminDashboard user={user} setUser={setUser} />;
  if (user.role === "manager") return <ManagerDashboard user={user} setUser={setUser} />;
  return <UserDashboard user={user} setUser={setUser} />;
}
`;
fs.writeFileSync('app/page.tsx', content);
