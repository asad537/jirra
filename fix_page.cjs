const fs = require('fs');

const content = `"use client";
import { useState, useEffect } from "react";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import UserDashboard from "@/components/dashboards/UserDashboard";

const apiFetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const isApi = url.startsWith("/api");
  if (!isApi) return fetch(input, init);
  const token = typeof window !== "undefined" ? localStorage.getItem("jirra_token") : null;
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", \`Bearer \${token}\`);
  return fetch(input, { ...init, headers });
};

export default function Home() {
  const [user, setUser] = useState(null);
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
    loadUser();
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!response.ok) throw new Error();
      loadUser();
    } catch {
      setLoginError("Invalid credentials");
      setAuthLoading(false);
      setTimeout(() => setLoginError(""), 3000);
    }
  };

  if (authLoading && !user) return <div className="auth-page"><div className="auth-card"><div className="auth-logo">T</div><h1>TaskFlow</h1><p>Connecting to your workspace…</p></div></div>;
  if (!user) return <div className="auth-page"><form className="auth-card" onSubmit={handleLogin}><div className="auth-logo">T</div><h1>Welcome back</h1><p>Sign in to manage projects, tickets and your team.</p><label>Email<input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required /></label><label>Password<input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} autoFocus required /></label>{loginError&&<div className="auth-error">{loginError}</div>}<button className="panel-primary" disabled={authLoading}>Sign in</button><small>Demo Accounts: admin@jirra.local, manager@jirra.local, user@jirra.local (Pass: password123)</small></form></div>;

  if (user.role === "super_admin") return <AdminDashboard user={user} setUser={setUser} />;
  if (user.role === "manager") return <ManagerDashboard user={user} setUser={setUser} />;
  return <UserDashboard user={user} setUser={setUser} />;
}
`;
fs.writeFileSync('app/page.tsx', content);
