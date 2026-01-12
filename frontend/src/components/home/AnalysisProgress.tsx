"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Circle } from "lucide-react";
import { AnalysisStep } from "@/lib/api";

interface AnalysisProgressProps {
  currentStep: AnalysisStep | null;
  completedSteps: AnalysisStep[];
  isProcessing: boolean;
}

const STEPS: { key: AnalysisStep; label: string; description: string }[] = [
  { key: "summary", label: "Summary", description: "Extracting key information from your resume" },
  { key: "gaps", label: "Gap Analysis", description: "Identifying missing skills and certifications" },
  { key: "roadmap", label: "Career Roadmap", description: "Creating your personalized career path" },
  { key: "keywords", label: "Job Keywords", description: "Generating optimal job search terms" },
];

export function AnalysisProgress({ currentStep, completedSteps, isProcessing }: AnalysisProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Auto-scroll to current step when it changes
  useEffect(() => {
    if (currentStep && stepRefs.current.has(currentStep)) {
      const stepElement = stepRefs.current.get(currentStep);
      stepElement?.scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      });
    }
  }, [currentStep]);

  // Scroll to container when analysis starts
  useEffect(() => {
    if (containerRef.current && isProcessing) {
      containerRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }
  }, [isProcessing]);

  const getStepStatus = (stepKey: AnalysisStep): "pending" | "processing" | "complete" => {
    if (completedSteps.includes(stepKey)) return "complete";
    if (currentStep === stepKey && isProcessing) return "processing";
    return "pending";
  };

  const setStepRef = (key: string) => (el: HTMLDivElement | null) => {
    if (el) {
      stepRefs.current.set(key, el);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto scroll-mt-8"
    >
      <div className="rounded-2xl p-6 md:p-8 border border-white/10 bg-card/50 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-white mb-6 text-center">
          Analyzing Your Resume
        </h3>
        
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step.key);
            
            return (
              <motion.div
                key={step.key}
                ref={setStepRef(step.key)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: status === "processing" ? 1.02 : 1
                }}
                transition={{ 
                  delay: index * 0.1,
                  scale: { duration: 0.3 }
                }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  status === "processing" 
                    ? "bg-primary/10 border border-primary/30 shadow-lg shadow-primary/10" 
                    : status === "complete"
                    ? "bg-green-500/10 border border-green-500/30"
                    : "bg-white/5 border border-white/5"
                }`}
              >
                {/* Step Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  status === "processing"
                    ? "bg-primary/20 text-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                    : status === "complete"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-white/10 text-muted-foreground"
                }`}>
                  {status === "processing" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : status === "complete" ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium transition-colors duration-300 ${
                    status === "processing"
                      ? "text-primary"
                      : status === "complete"
                      ? "text-green-400"
                      : "text-muted-foreground"
                  }`}>
                    {step.label}
                    {status === "processing" && (
                      <span className="ml-2 text-xs opacity-70 animate-pulse">Processing...</span>
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {step.description}
                  </p>
                </div>

                {/* Step Number */}
                <div className={`text-sm font-mono transition-colors duration-300 ${
                  status === "complete" ? "text-green-400" : "text-muted-foreground"
                }`}>
                  {index + 1}/4
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-green-400"
              initial={{ width: "0%" }}
              animate={{ 
                width: `${(completedSteps.length / STEPS.length) * 100}%` 
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {completedSteps.length} of {STEPS.length} steps complete
          </p>
        </div>
      </div>
    </motion.div>
  );
}
