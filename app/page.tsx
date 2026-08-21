"use client";
import { useState, useEffect } from "react";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import UserDashboard from "@/components/dashboards/UserDashboard";

const apiPath = (path: string) =>
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? `http://localhost:4001${path}`
    : path;
const apiFetch = (path: string, init: RequestInit = {}) =>
  fetch(apiPath(path), { ...init, credentials: "include" });

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

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setLoginError("");
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      setUser(data.user);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Invalid credentials");
      setTimeout(() => setLoginError(""), 3000);
    } finally {
      setAuthLoading(false);
    }
  };

  if (authLoading && !user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">T</div>
          <h1>TaskFlow</h1>
          <p>Connecting to your workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={handleLogin}>
          <div className="auth-logo">T</div>
          <h1>Welcome back</h1>
          <p>Sign in to manage projects, tickets and your team.</p>
          <label>Email<input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required /></label>
          <label>Password<input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} autoFocus required /></label>
          {loginError && <div className="auth-error">{loginError}</div>}
          <button className="panel-primary" disabled={authLoading}>Sign in</button>
          <small>Demo: admin@jirra.local (Pass: ChangeMe123!), zara@jirra.local (Pass: Member123!)</small>
        </form>
      </div>
    );
  }

  if (user.role === "super_admin") return <AdminDashboard user={user} setUser={setUser} />;
  if (user.role === "manager") return <ManagerDashboard user={user} setUser={setUser} />;
  return <UserDashboard user={user} setUser={setUser} />;
}
