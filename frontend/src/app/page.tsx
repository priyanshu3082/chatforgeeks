"use client";

import Link from "next/link";
import { ArrowRight, BarChart2, Database, MessageSquare, Sparkles, Code, Zap, User } from "lucide-react";
import { useAuth } from "@/utils/AuthContext";

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#101111] text-[#1a1816] dark:text-[#ffffff] font-sans selection:bg-[#2bc574]/20">
      {/* Navigation */}
      <nav className="border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#121715]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2bc574] to-[#22a862] flex items-center justify-center text-white">
              <BarChart2 size={18} />
            </div>
            <span>ChatForGeeks</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-neutral-600 dark:text-[#8b9993]">
            <Link href="/" className="text-black dark:text-white hover:text-[#2bc574] dark:hover:text-[#2bc574] transition-colors">
              Home
            </Link>
            <Link href="#features" className="hover:text-[#2bc574] dark:hover:text-[#2bc574] transition-colors">
              Features
            </Link>
            <Link href="#team" className="hover:text-[#2bc574] dark:hover:text-[#2bc574] transition-colors">
              Team
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {!loading && user ? (
              <>
                <div className="flex items-center gap-2 animate-fade-in bg-neutral-100 dark:bg-[#1c2823] px-3 py-1.5 rounded-full border border-neutral-200 dark:border-[#24352f]">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#2bc574] text-[#121715] flex items-center justify-center">
                      <User size={14} />
                    </div>
                  )}
                  <span className="text-sm font-medium mr-1 truncate max-w-[100px] hidden sm:block">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </div>
                <Link 
                  href="/dashboard"
                  className="text-sm font-medium bg-[#1a1816] dark:bg-[#2bc574] text-white dark:text-black px-5 py-2 rounded-full hover:bg-neutral-800 dark:hover:bg-[#22a862] transition-all shadow-sm flex items-center gap-2 animate-fade-in"
                >
                  Dashboard <ArrowRight size={14} />
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="text-sm font-medium hover:text-[#2bc574] transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/login"
                  className="text-sm font-medium bg-[#1a1816] dark:bg-[#2bc574] text-white dark:text-black px-5 py-2 rounded-full hover:bg-neutral-800 dark:hover:bg-[#22a862] transition-all shadow-sm flex items-center gap-2"
                >
                  Open Dashboard <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[#2bc574]/[0.02] dark:bg-[#2bc574]/5" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="max-w-7xl mx-auto px-6 relative text-center">
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] max-w-4xl mx-auto flex flex-col items-center">
              Talk to your data in <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2bc574] to-[#4ade80]">
                plain English.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-neutral-600 dark:text-[#c4d1cb] max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your CSVs, ask business questions naturally, and instantly get SQL-generated charts powered by AI. No coding required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard"
                className="inline-flex justify-center items-center gap-2 bg-[#2bc574] text-black px-8 py-4 rounded-full font-bold hover:bg-[#22a862] transition-all shadow-lg shadow-[#2bc574]/25 hover:-translate-y-0.5"
              >
                Chat with Dataset
                <Sparkles size={18} />
              </Link>
            </div>
            
            {/* Visual Demo / Interface Mockup */}
            <div className="mt-16 mx-auto max-w-5xl rounded-2xl border border-black/10 dark:border-[#1c2823] shadow-2xl overflow-hidden bg-white/50 dark:bg-[#121715] backdrop-blur-xl">
               <div className="h-12 border-b border-black/10 dark:border-[#1c2823] flex items-center px-4 gap-2 bg-neutral-100/50 dark:bg-[#101111]">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <div className="p-8 md:p-12 text-left">
                 <div className="flex gap-4 items-start mb-8">
                   <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-[#1c2823] flex items-center justify-center shrink-0">
                     User
                   </div>
                   <div className="bg-white dark:bg-[#1c2823] text-black dark:text-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-neutral-200 dark:border-[#24352f]">
                     "Show me the overall summary of my sales datset over the past year"
                   </div>
                 </div>
                 <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2bc574] to-[#22a862] text-white flex items-center justify-center shrink-0 shadow-lg">
                     <Sparkles size={18} />
                   </div>
                   <div className="bg-white dark:bg-[#121715] p-4 rounded-2xl rounded-tl-sm shadow-sm border border-neutral-200 dark:border-[#1c2823] w-full">
                     <div className="flex items-center gap-2 text-sm text-[#2bc574] mb-4 font-mono bg-[#2bc574]/10 p-2 rounded px-3">
                       <Database size={14} /> Generating full dataset analysis...
                     </div>
                     <div className="h-48 rounded-xl border border-neutral-100 dark:border-[#1c2823] bg-neutral-50 dark:bg-[#101111] flex items-end justify-around p-4 gap-2">
                        <div className="flex-1 bg-[#2bc574]/80 rounded-t-sm h-[40%]"></div>
                        <div className="flex-1 bg-[#2bc574] rounded-t-sm h-[70%]"></div>
                        <div className="flex-1 bg-[#4ade80] rounded-t-sm h-[100%]"></div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Features Row */}
        <section id="features" className="py-24 bg-white dark:bg-[#101111] border-y border-black/5 dark:border-[#1c2823]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8 text-left">
              
              <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-[#121715] border border-neutral-100 dark:border-[#1c2823]">
                <div className="w-12 h-12 rounded-xl bg-[#2bc574]/10 text-[#2bc574] flex items-center justify-center mb-6">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Natural Language</h3>
                <p className="text-neutral-600 dark:text-[#8b9993]">
                  Stop writing complex queries. Just ask questions in everyday english and our AI engine translates your intent directly into optimized SQL.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-[#121715] border border-neutral-100 dark:border-[#1c2823]">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                  <Database size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant CSV Upload</h3>
                <p className="text-neutral-600 dark:text-[#8b9993]">
                  Drag and drop any CSV file. We automatically interpret the schema and spin up a lightweight virtual database ready for conversational querying.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-[#121715] border border-neutral-100 dark:border-[#1c2823]">
                <div className="w-12 h-12 rounded-xl bg-[#2bc574]/10 text-[#2bc574] flex items-center justify-center mb-6">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Interactive Charts</h3>
                <p className="text-neutral-600 dark:text-[#8b9993]">
                  Beyond tables, our engine dynamically selects and renders the perfect chart (Bar, Line, Scatter, Pie) based on the shape of your result data.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Hackathon Acknowledgment & Team */}
        <section id="team" className="py-16 bg-[#2bc574]/10 border-b border-[#2bc574]/20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2bc574] text-[#101111] mb-6 shadow-xl shadow-[#2bc574]/30">
              <Code size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#1a1816] dark:text-white">
              Proudly built by <span className="text-[#2bc574]">Team AI Champs</span>
            </h2>
            <p className="text-lg text-neutral-700 dark:text-[#c4d1cb] max-w-2xl mx-auto mb-8">
              A huge thank you to <strong className="text-[#2bc574]">GeeksforGeeks Classroom</strong> and <strong className="text-[#2bc574]">JISCE Kolkata</strong> for organizing this incredible hackathon and providing us the platform to innovate.
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              {/* Priyanshu Nayan */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#121715] border border-neutral-200 dark:border-[#1c2823] shadow-sm transform hover:-translate-y-1 transition-all">
                <h3 className="text-lg font-bold text-black dark:text-white mb-1">
                  Priyanshu Nayan
                </h3>
                <p className="text-xs text-[#2bc574] font-semibold tracking-wider uppercase mb-4">Captain</p>
                <div className="flex gap-4">
                  <a href="https://www.linkedin.com/in/priyanshu-nayan/" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-[#0077B5] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  </a>
                  <a href="https://github.com/priyanshu3082" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-[#181717] dark:hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  </a>
                </div>
              </div>

              {/* Saurav Kumar */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#121715] border border-neutral-200 dark:border-[#1c2823] shadow-sm transform hover:-translate-y-1 transition-all">
                <h3 className="text-lg font-bold text-black dark:text-white mb-1">
                  Saurav Kumar
                </h3>
                <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase mb-4">Member</p>
                <div className="flex gap-4">
                  <a href="https://www.linkedin.com/in/saurav-kumar-b5baaa386/" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-[#0077B5] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  </a>
                  <a href="https://github.com/Sauravkm217" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-[#181717] dark:hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  </a>
                </div>
              </div>

              {/* Soumalya Bhar */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#121715] border border-neutral-200 dark:border-[#1c2823] shadow-sm transform hover:-translate-y-1 transition-all">
                <h3 className="text-lg font-bold text-black dark:text-white mb-1">
                  Soumalya Bhar
                </h3>
                <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase mb-4">Member</p>
                <div className="flex gap-4">
                  <a href="https://www.linkedin.com/in/soumalya-bhar-599562392/" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-[#0077B5] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-neutral-900 dark:bg-[#121715] text-white text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-6">Ready to decode your data?</h2>
            <p className="text-[#8b9993] mb-10 text-lg">
              Unlock insights instantly without writing a single line of code.
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex justify-center items-center gap-2 bg-[#2bc574] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#22a862] transition-all shadow-[0_0_40px_-5px_var(--tw-shadow-color)] shadow-[#2bc574]/30 hover:-translate-y-1"
            >
              Start Chatting
              <MessageSquare size={20} />
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="py-8 text-center text-sm text-neutral-500 border-t border-black/5 dark:border-[#1c2823] bg-white/50 dark:bg-[#101111]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© 2026 ChatForGeeks. All rights reserved.</div>
          <div className="flex gap-2 text-[#2bc574] font-medium">
            Built with 💚 for GFG Hackathon
          </div>
        </div>
      </footer>
    </div>
  );
}
