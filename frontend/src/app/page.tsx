import Link from "next/link";
import { ArrowRight, Zap, Shield, Globe, Terminal, FileBox, LayoutTemplate } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 font-sans selection:bg-primary/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200 dark:border-zinc-900/50 bg-zinc-50/80 dark:bg-[#09090b]/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
             <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
               <span className="text-[#09090b] font-black">P</span>
             </div>
             <span>Peerlink</span>
          </div>
          <div className="flex items-center gap-6">
            <ModeToggle />
            <Link href="/dashboard" className="hidden md:flex font-medium text-sm hover:text-primary transition-colors">
               Enter Dashboard
            </Link>
            <Link href="/dashboard" className="bg-primary hover:bg-orange-600 text-white dark:text-[#09090b] px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 container mx-auto max-w-7xl">
        
        {/* Massive Hero Section */}
        <div className="flex flex-col items-center text-center mt-12 mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-bold text-sm mb-8">
             <Zap className="w-4 h-4" /> The New Standard in Local Sharing
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1] max-w-5xl">
            Routing Meaningful <br/> <span className="text-primary">Connections</span> & Files.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mb-12 font-medium">
            A premium dashboard handling secure file transfers, team directories, and product catalogs with absolutely zero hassle.
          </p>
          <Link href="/dashboard" className="bg-primary hover:bg-orange-600 text-white dark:text-[#09090b] px-10 py-5 rounded-full font-black text-xl transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 flex items-center gap-3 hover:-translate-y-1">
            Launch Platform <ArrowRight className="w-6 h-6" />
          </Link>
        </div>

        {/* Bento Box Features Grid */}
        <div className="flex justify-center mb-24">
          {/* Feature 1 - Spans absolute center */}
          <div className="w-full bg-white dark:bg-[#111113] rounded-3xl p-10 border border-zinc-200 dark:border-zinc-800/80 shadow-2xl overflow-hidden relative group">
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] group-hover:bg-primary/30 transition-all"></div>
            <FileBox className="w-16 h-16 text-primary mb-6" />
            <h3 className="text-4xl font-bold tracking-tight mb-4">Blazing Fast Transfers</h3>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mb-8 font-medium">
              Send large files directly to your peers and team members easily. Secure, native, and completely seamless point-to-point delivery.
            </p>
            <div className="flex gap-4">
              <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-lg text-sm font-bold">100% Direct</span>
              <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-lg text-sm font-bold">Zero Delays</span>
            </div>
          </div>
        </div>

      </main>

      {/* Brutalist Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#09090b]">
        <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center">
           <div className="font-bold text-2xl flex items-center gap-2 mb-6 md:mb-0">
             <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
               <span className="text-[#09090b] font-black text-xs">P</span>
             </div>
             Peerlink <span className="text-primary">.</span>
           </div>
           <div className="flex gap-8 font-medium text-sm text-zinc-500">
             <a href="#" className="hover:text-primary transition-colors">Documentation</a>
             <a href="#" className="hover:text-primary transition-colors">Privacy</a>
             <a href="#" className="hover:text-primary transition-colors">Terms</a>
           </div>
        </div>
      </footer>
    </div>
  );
}
