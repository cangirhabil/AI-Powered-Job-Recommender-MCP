const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AnalysisResponse {
  summary: string;
  gaps: string;
  roadmap: string;
  keywords: string[];
}

export interface Job {
  title: string;
  companyName?: string;
  location?: string;
  link?: string;
  url?: string;
  jobUrl?: string;
  applyUrl?: string;
}

export interface JobsResponse {
  linkedin: Job[];
}

export type AnalysisStep = 'summary' | 'gaps' | 'roadmap' | 'keywords' | 'done';

export interface StreamEvent {
  step: AnalysisStep;
  status: 'processing' | 'complete';
  data?: string | string[] | AnalysisResponse;
}

/**
 * Analyzes a resume using streaming SSE to show progress step by step.
 * Each step (summary, gaps, roadmap, keywords) is processed sequentially.
 */
export const analyzeResumeStream = async (
  file: File,
  onStepUpdate: (event: StreamEvent) => void
): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/analyze-resume`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to analyze resume");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let finalResult: AnalysisResponse | null = null;

  if (!reader) {
    throw new Error("No response body");
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event: StreamEvent = JSON.parse(line.slice(6));
          onStepUpdate(event);
          
          if (event.step === 'done' && event.status === 'complete') {
            finalResult = event.data as AnalysisResponse;
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      }
    }
  }

  if (!finalResult) {
    throw new Error("Analysis did not complete properly");
  }

  return finalResult;
};

export const fetchJobs = async (keywords: string): Promise<JobsResponse> => {
  const response = await fetch(`${API_URL}/fetch-jobs?keywords=${encodeURIComponent(keywords)}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return response.json();
};
