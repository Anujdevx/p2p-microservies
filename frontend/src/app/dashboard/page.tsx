import { ModeToggle } from '@/components/mode-toggle';
import { Sparkles } from 'lucide-react';
import FileTransferDashboardDefault from '@/components/FileTransferDashboard';
import { FileMetadataDashboard } from '@/components/FileMetadataDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] font-sans text-zinc-900 dark:text-zinc-50 selection:bg-primary/30">
      
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left py-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center justify-center md:justify-start gap-4 text-zinc-900 dark:text-zinc-100">
              <span className="p-3 bg-white dark:bg-[#111113] rounded-2xl shadow-xl dark:shadow-none border border-zinc-200 dark:border-zinc-800">
                <Sparkles className="w-10 h-10 text-primary" />
              </span>
              Peerlink Control Center
            </h1>
            <p className="mt-4 text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl font-medium">
              Your dedicated local hub for secure P2P file transfers and metadata management.
            </p>
          </div>
          <div className="mt-8 md:mt-0 flex items-center gap-4">
            <ModeToggle />
            <div className="flex items-center gap-3 bg-white dark:bg-[#111113] px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg dark:shadow-none">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-bold tracking-wide text-zinc-900 dark:text-zinc-100">System Online</span>
            </div>
          </div>
        </header>

        <main className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Tabs defaultValue="transfer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="transfer">File Transfer</TabsTrigger>
              <TabsTrigger value="metadata">File Metadata</TabsTrigger>
            </TabsList>
            <TabsContent value="transfer">
              <FileTransferDashboardDefault />
            </TabsContent>
            <TabsContent value="metadata">
              <FileMetadataDashboard />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
