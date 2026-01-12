"use client";

import React, { useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { useResumeAnalysis } from "@/hooks/useResumeAnalysis";
import { HeroSection } from "@/components/home/HeroSection";
import { UploadZone } from "@/components/home/UploadZone";
import { AnalysisDashboard } from "@/components/home/AnalysisDashboard";
import { AnalysisProgress } from "@/components/home/AnalysisProgress";

export default function Home() {
  const {
    file,
    analyzing,
    fetchingJobs,
    analysis,
    jobs,
    progress,
    handleFileChange,
    handleUpload,
    handleGetJobs,
  } = useResumeAnalysis();

  const fileInputRef = useRef<HTMLInputElement>(null!);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen relative p-6 md:p-12 max-w-7xl mx-auto space-y-16">
      <Toaster position="top-center" richColors theme="dark" />
      
      <HeroSection />

      <UploadZone 
        file={file}
        analyzing={analyzing}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
        fileInputRef={fileInputRef}
        triggerFileInput={triggerFileInput}
      />

      <AnimatePresence mode="wait">
        {analyzing && (
          <AnalysisProgress
            currentStep={progress.currentStep}
            completedSteps={progress.completedSteps}
            isProcessing={progress.isProcessing}
          />
        )}
        
        {!analyzing && analysis && (
          <AnalysisDashboard
            analysis={analysis}
            jobs={jobs}
            fetchingJobs={fetchingJobs}
            onGetJobs={handleGetJobs}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
