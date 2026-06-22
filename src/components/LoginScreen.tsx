import { useState } from "react";
import { supabase } from "../supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/fam.png" alt="" className="w-40 h-40 object-contain mx-auto mb-2" />
          <h1 className="text-2xl font-semibold text-gray-800">Lissi & Babs</h1>
          <p className="text-sm text-gray-400 mt-1">Otis's family calendar</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              placeholder="you@email.com" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              placeholder="••••••••" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-500 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
