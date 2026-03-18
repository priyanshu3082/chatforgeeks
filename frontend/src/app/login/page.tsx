"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/AuthContext";
import { auth } from "@/utils/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider
} from "firebase/auth";
import { Sparkles, Command, Activity, BarChart2, ArrowRight } from "lucide-react";
import Link from "next/link";


export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen bg-[#101111] flex items-center justify-center text-white">Loading...</div>;

  const handleFirebaseError = (err: any) => {
    console.error("Firebase Auth Error:", err);
    const code = err.code;
    if (code?.includes("api-key")) return "Invalid Firebase API key. You must add the Web App keys (like NEXT_PUBLIC_FIREBASE_API_KEY) to your .env.local file!";
    if (code === "auth/invalid-email") return "The email address is improperly formatted.";
    if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") return "Invalid email or password.";
    if (code === "auth/email-already-in-use") return "This email is already registered.";
    if (code === "auth/weak-password") return "Password should be at least 6 characters.";
    if (code === "auth/popup-closed-by-user") return "Sign in popup was closed.";
    if (code === "auth/operation-not-allowed") return "Email/Password sign-in is not enabled in Firebase Console.";
    return err.message || "An error occurred during authentication. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(handleFirebaseError(err));
    }
  };

  const handleProviderSignIn = async (provider: any) => {
    setError("");
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(handleFirebaseError(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#101111] text-[#1a1816] dark:text-[#ffffff] flex flex-col selection:bg-[#2bc574]/20">

      {/* ── Navbar ── */}
      <nav className="border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-[#121715]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2bc574] to-[#22a862] flex items-center justify-center text-white">
              <BarChart2 size={18} />
            </div>
            <span>ChatForGeeks</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-neutral-600 dark:text-[#8b9993]">
            <Link href="/" className="hover:text-[#2bc574] transition-colors">Home</Link>
            <Link href="/#features" className="hover:text-[#2bc574] transition-colors">Features</Link>
            <Link href="/#team" className="hover:text-[#2bc574] transition-colors">Team</Link>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold bg-[#1a1816] dark:bg-[#2bc574] text-white dark:text-black px-5 py-2 rounded-full hover:bg-[#2bc574] dark:hover:bg-[#22a862] hover:text-black transition-all shadow-sm flex items-center gap-2">
            Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 text-[#2bc574]/10 animate-pulse pointer-events-none">
          <Activity size={120} strokeWidth={1} />
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-[#2bc574]/10 animate-bounce pointer-events-none">
          <Command size={100} strokeWidth={1} />
        </div>

      <div className="w-full max-w-md bg-white dark:bg-[#121715] p-8 rounded-2xl shadow-2xl border border-neutral-200 dark:border-[#1c2823] relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2bc574] to-[#22a862] flex items-center justify-center text-white mb-4 shadow-lg animate-pulse">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ChatForGeeks</h1>
          <p className="text-sm text-neutral-500 dark:text-[#8b9993] mt-2 text-center">
            {isLogin ? "Sign in to access your dashboard" : "Create an account to get started"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm text-center font-medium animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-[#c4d1cb]">Full Name</label>
              <input
                type="text"
                required={!isLogin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-[#101111] border border-neutral-300 dark:border-[#1c2823] p-3 rounded-lg focus:outline-none focus:border-[#2bc574] focus:ring-1 focus:ring-[#2bc574] transition-all"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-[#c4d1cb]">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-[#101111] border border-neutral-300 dark:border-[#1c2823] p-3 rounded-lg focus:outline-none focus:border-[#2bc574] focus:ring-1 focus:ring-[#2bc574] transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-[#c4d1cb]">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-[#101111] border border-neutral-300 dark:border-[#1c2823] p-3 rounded-lg focus:outline-none focus:border-[#2bc574] focus:ring-1 focus:ring-[#2bc574] transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#2bc574] hover:bg-[#22a862] text-black font-bold py-3 rounded-lg transition-colors mt-2 shadow-md shadow-[#2bc574]/20"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-neutral-200 dark:border-[#1c2823]"></div>
          <span className="px-3 text-xs text-neutral-500 dark:text-[#8b9993] uppercase font-semibold">Or</span>
          <div className="flex-1 border-t border-neutral-200 dark:border-[#1c2823]"></div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleProviderSignIn(new GoogleAuthProvider())}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#101111] border border-neutral-200 dark:border-[#1c2823] hover:bg-neutral-50 dark:hover:bg-[#1c2823] text-black dark:text-white font-medium py-3 rounded-lg transition-colors"
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continue with Google
          </button>
          
          <button
            onClick={() => handleProviderSignIn(new OAuthProvider('apple.com'))}
            className="w-full flex items-center justify-center gap-3 bg-black dark:bg-[#ffffff] text-white dark:text-black font-medium py-3 rounded-lg transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200"
          >
            <svg width="18" height="18" viewBox="0 0 170 170" fill="currentColor">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.92.21-9.84-1.96-14.74-6.53-3.13-2.73-7.1-7.43-11.92-14.09-6.23-8.65-11.09-19.12-14.59-31.42C16.14 101.45 14.42 89.9 14.42 79.31c0-11.63 2.65-21.65 7.95-30.07 5.3-8.41 12.39-14.48 21.28-18.19 8.23-3.41 16.73-3.76 25.5-.35 5.25 2.05 9.06 3.08 11.45 3.08 1.95 0 5.4-1.07 10.33-3.23 6.94-3.03 14.28-4.23 22-3.58 10.6.93 19.33 4.88 26.21 11.83-8.81 5.37-13.29 13.06-13.43 23.08-.13 8.35 2.89 15.11 9.07 20.25 6.18 5.15 13.54 7.93 22.09 8.36-1.94 13.19-6.85 26.15-14.5 39.76z"/>
              <path d="M115.81 12.23c0 7.3-2.45 13.91-7.36 19.85-6.14 7.37-14.05 11.45-22.18 11.45-1.02 0-1.89-.06-2.58-.18 0-6.73 2.65-13.21 7.95-19.43 5.3-6.22 12.35-10.36 21.14-11.44 1.13-.16 2.14-.25 3.03-.25z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-neutral-500 dark:text-[#8b9993] hover:text-[#2bc574] dark:hover:text-[#2bc574] transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-black/5 dark:border-[#1c2823] bg-white/50 dark:bg-[#101111] py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-neutral-500 dark:text-[#8b9993]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#2bc574] to-[#22a862] flex items-center justify-center">
              <BarChart2 size={11} className="text-white" />
            </div>
            <span className="font-semibold text-[#1a1816] dark:text-white">ChatForGeeks</span>
            <span className="mx-1">·</span>
            <span>© 2026 All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap justify-center">
            Built with <span className="text-red-500 mx-1">♥</span> by
            <span className="font-semibold text-[#2bc574] mx-1">AI Champs</span>–
            <a href="https://www.linkedin.com/in/priyanshu-nayan/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2bc574] transition-colors ml-1">Priyanshu</a>
            <span className="mx-1">·</span>
            <a href="https://www.linkedin.com/in/saurav-kumar-b5baaa386/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2bc574] transition-colors">Saurav</a>
            <span className="mx-1">·</span>
            <a href="https://www.linkedin.com/in/soumalya-bhar-599562392/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2bc574] transition-colors">Soumalya</a>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-[#2bc574] transition-colors">Home</Link>
            <Link href="/#team" className="hover:text-[#2bc574] transition-colors">Team</Link>
            <Link href="/dashboard" className="hover:text-[#2bc574] transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
