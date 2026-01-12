"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, Zap, Map, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisResponse, JobsResponse } from "@/lib/api";
import { JobResults } from "@/components/home/JobResults";

interface AnalysisDashboardProps {
  analysis: AnalysisResponse;
  jobs: JobsResponse | null;
  fetchingJobs: boolean;
  onGetJobs: () => void;
}

// Markdown styles for consistent rendering
const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-xl font-bold text-white mb-3 mt-4">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-lg font-semibold text-white mb-2 mt-3">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-base font-semibold text-white/90 mb-2 mt-2">{children}</h3>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-3 leading-relaxed">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="text-muted-foreground">{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-white/80">{children}</em>,
  hr: () => <hr className="my-4 border-white/10" />,
};

export function AnalysisDashboard({
  analysis,
  jobs,
  fetchingJobs,
  onGetJobs
}: AnalysisDashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to dashboard when it appears
  useEffect(() => {
    if (dashboardRef.current) {
      dashboardRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }
  }, []);

  return (
    <motion.div 
      ref={dashboardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-12 pb-24 scroll-mt-8"
    >
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* Summary - Spans 8 cols */}
        <div className="lg:col-span-8 group">
          <Card className="glass-panel h-full border-white/5 hover:border-primary/20 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                 </div>
                 <CardTitle className="text-xl">Executive Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground prose prose-invert prose-sm max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {analysis.summary}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </div>

        {/* Gaps - Spans 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-panel border-white/5 hover:border-accent/20 transition-all h-full">
            <CardHeader>
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                    <Zap className="w-6 h-6" />
                 </div>
                 <CardTitle className="text-xl">Identified Gaps</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground prose prose-invert prose-sm max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {analysis.gaps}
              </ReactMarkdown>
            </CardContent>
          </Card>
        </div>

        {/* Roadmap - Spans 12 cols (Full Width) */}
        <div className="lg:col-span-12">
           <Card className="glass-panel border-white/5 hover:border-blue-500/20 transition-all">
              <CardHeader>
                 <div className="flex items-center gap-3">
                     <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Map className="w-6 h-6" />
                     </div>
                     <CardTitle className="text-xl">Strategic Roadmap</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="text-muted-foreground prose prose-invert prose-sm max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {analysis.roadmap}
                </ReactMarkdown>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Keyword Extraction */}
      <div className="flex flex-col items-center space-y-6">
         <h3 className="text-2xl font-semibold tracking-tight">Extracted Skills & Keywords</h3>
         <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
            {analysis.keywords && analysis.keywords.length > 0 ? (
              analysis.keywords.map((kw, i) => (
                <Badge 
                  key={i} 
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border-white/10 text-sm transition-all cursor-default"
                >
                  {kw}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">No keywords extracted</p>
            )}
         </div>
         
         {!jobs && (
           <Button 
             size="lg" 
             onClick={onGetJobs} 
             disabled={fetchingJobs || !analysis.keywords || analysis.keywords.length === 0}
             className="mt-8 h-14 px-10 text-lg bg-accent text-accent-foreground hover:bg-accent/80 font-bold shadow-[0_0_25px_-5px_var(--color-accent)]"
           >
              {fetchingJobs ? (
                <span className="animate-pulse">Scanning Job Market...</span>
              ) : (
                <span className="flex items-center gap-2">
                  Find Matching Opportunities <Search className="w-5 h-5" />
                </span>
              )}
           </Button>
         )}
      </div>

      {/* Jobs Grid */}
      {jobs && <JobResults jobs={jobs} />}

    </motion.div>
  );
}
