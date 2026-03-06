import Head from "next/head";
import { FormEvent, useState } from "react";

import { login } from "@/services/api";
import { setToken } from "@/store/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin12345");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(username, password);
      setToken(response.access_token);
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Dissertation Registry</title>
      </Head>
      <div className="center-screen">
        <form className="card auth-card" onSubmit={onSubmit}>
          <h1>Tizimga kirish</h1>
          <label>
            Login
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label>
            Parol
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <div className="error-banner">{error}</div>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Kutilmoqda..." : "Kirish"}
          </button>
          <p className="muted">OneID callback endpoint API orqali tayyorlangan.</p>
        </form>
      </div>
    </>
  );
}
