import Link from "next/link";
import { ArrowRight, BarChart2, Database, MessageSquare, Sparkles, Code, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#1a1816] text-[#1a1816] dark:text-[#e8e2d8] font-sans selection:bg-[#2f8d46]/20">
      {/* Navigation */}
      <nav className="border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d97706] to-[#92400e] flex items-center justify-center text-white">
              <BarChart2 size={18} />
            </div>
            <span>ChatForGeeks</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="text-sm font-medium hover:text-[#d97706] transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/dashboard"
              className="text-sm font-medium bg-[#1a1816] dark:bg-white text-white dark:text-black px-5 py-2 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-sm flex items-center gap-2"
            >
              Open Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[#d97706]/[0.02] dark:bg-[#d97706]/5" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="max-w-7xl mx-auto px-6 relative text-center">
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] max-w-4xl mx-auto flex flex-col items-center">
              Talk to your data in <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d97706] to-[#fbbf24]">
                plain English.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your CSVs, ask business questions naturally, and instantly get SQL-generated charts powered by Claude AI. No coding required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard"
                className="inline-flex justify-center items-center gap-2 bg-[#d97706] text-white px-8 py-4 rounded-full font-medium hover:bg-[#b45309] transition-all shadow-lg shadow-[#d97706]/25 hover:-translate-y-0.5"
              >
                Try the Dashboard Now
                <ArrowRight size={18} />
              </Link>
            </div>
            
            {/* Visual Demo / Interface Mockup */}
            <div className="mt-16 mx-auto max-w-5xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden bg-white/50 dark:bg-black/40 backdrop-blur-xl">
               <div className="h-12 border-b border-black/10 dark:border-white/10 flex items-center px-4 gap-2 bg-neutral-100/50 dark:bg-neutral-900/50">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <div className="p-8 md:p-12">
                 <div className="flex gap-4 items-start mb-8">
                   <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                     User
                   </div>
                   <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl rounded-tl-sm shadow-sm border border-neutral-200 dark:border-neutral-700">
                     "Show me the monthly revenue trend for electronics in Q3"
                   </div>
                 </div>
                 <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d97706] to-[#92400e] text-white flex items-center justify-center shrink-0 shadow-lg">
                     <Sparkles size={18} />
                   </div>
                   <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl rounded-tl-sm shadow-sm border border-neutral-200 dark:border-neutral-700 w-full">
                     <div className="flex items-center gap-2 text-sm text-[#d97706] mb-3 font-mono bg-[#d97706]/10 p-2 rounded px-3">
                       <Database size={14} /> SELECT month, SUM(revenue) FROM sales WHERE quarter = 'Q3' GROUP BY month
                     </div>
                     <div className="h-48 rounded-xl border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex items-end justify-around p-4 gap-2">
                        <div className="flex-1 bg-[#d97706]/80 rounded-t-sm h-[40%]"></div>
                        <div className="flex-1 bg-[#d97706] rounded-t-sm h-[70%]"></div>
                        <div className="flex-1 bg-amber-500 rounded-t-sm h-[100%]"></div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Features Row */}
        <section id="features" className="py-24 bg-white dark:bg-[#211f1c]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              
              <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
                <div className="w-12 h-12 rounded-xl bg-[#d97706]/10 text-[#d97706] flex items-center justify-center mb-6">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Natural Language</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Stop writing complex queries. Just ask questions in everyday english and our AI engine translates your intent directly into optimized SQL.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                  <Database size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant CSV Upload</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Drag and drop any CSV file. We automatically interpret the schema and spin up a lightweight virtual database ready for conversational querying.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Interactive Charts</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Beyond tables, our engine dynamically selects and renders the perfect chart (Bar, Line, Scatter, Pie) based on the shape of your result data.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Hackathon Acknowledgment */}
        <section className="py-16 bg-[#2f8d46]/10 border-y border-[#2f8d46]/20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2f8d46] text-white mb-6 shadow-xl shadow-[#2f8d46]/30">
              <Code size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#1a1816] dark:text-white">
              Proudly built for GeeksforGeeks
            </h2>
            <p className="text-lg text-neutral-700 dark:text-neutral-300">
              A huge thank you to <strong>GeeksforGeeks Classroom</strong> and <strong>JISCE Kolkata</strong> for organizing this incredible hackathon and providing us the platform to innovate.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-neutral-900 dark:bg-black text-white text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-6">Ready to decode your data?</h2>
            <p className="text-neutral-400 mb-10 text-lg">
              Unlock insights instantly without writing a single line of code.
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex justify-center items-center gap-2 bg-[#d97706] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#b45309] transition-all shadow-[0_0_40px_-10px_#d97706] hover:-translate-y-1"
            >
              Launch Dashboard
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="py-8 text-center text-sm text-neutral-500 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#1a1816]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© 2026 ChatForGeeks. All rights reserved.</div>
          <div className="flex gap-2 text-[#2f8d46]">
            Built with 💚 for GFG Hackathon
          </div>
        </div>
      </footer>
    </div>
  );
}
