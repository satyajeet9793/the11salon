"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Scissors } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream text-brown-dark relative overflow-hidden" style={{ backgroundImage: "url('/images/bg-swirls.svg')", backgroundAttachment: "fixed", backgroundSize: "cover" }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gold/10 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/10 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl glass-card z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-gold/20 text-ochre rounded-full flex items-center justify-center mb-4 border border-gold/30">
            <Scissors className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-serif text-ochre mb-2">Salon Admin</h1>
          <p className="text-sm font-medium text-brown-light">Sign in to manage your business</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-600 font-bold text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-brown-dark mb-1">Email / Login ID</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-cream/50 border border-brown-dark/20 rounded-lg text-brown-dark focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all placeholder-brown-light/50"
              placeholder="admin@the11.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold text-brown-dark">Password</label>
              <a href="#" className="text-xs font-bold text-ochre hover:text-gold transition-colors">Forgot password?</a>
            </div>
            <input
              type="password"
              required
              className="w-full px-4 py-2 bg-cream/50 border border-brown-dark/20 rounded-lg text-brown-dark focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all placeholder-brown-light/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gold hover:bg-ochre text-cream font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-md"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
