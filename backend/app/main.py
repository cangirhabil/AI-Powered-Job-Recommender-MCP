from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Optional
import json
from .services import (
    extract_text_from_pdf, 
    ask_gemini, 
    fetch_linkedin_jobs,
    analyze_summary,
    analyze_gaps,
    analyze_roadmap,
    analyze_keywords
)
from .mcp_server import mcp
import pydantic

app = FastAPI(title="AI Job Recommender API")

# Mount MCP Server
# This exposes the MCP server at /mcp/sse and /mcp/messages
app.mount("/mcp", mcp.sse_app())

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisResponse(pydantic.BaseModel):
    summary: str
    gaps: str
    roadmap: str
    keywords: List[str]

@app.post("/analyze-resume")
async def analyze_resume_stream(file: UploadFile = File(...)):
    """
    Streaming endpoint that sends SSE events as each analysis step completes.
    Each event contains the step name and result.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    content = await file.read()
    resume_text = extract_text_from_pdf(content)
    
    def generate_analysis():
        results = {}
        
        # Step 1: Summary
        yield f"data: {json.dumps({'step': 'summary', 'status': 'processing'})}\n\n"
        summary = analyze_summary(resume_text)
        results['summary'] = summary
        yield f"data: {json.dumps({'step': 'summary', 'status': 'complete', 'data': summary})}\n\n"
        
        # Step 2: Gaps
        yield f"data: {json.dumps({'step': 'gaps', 'status': 'processing'})}\n\n"
        gaps = analyze_gaps(resume_text)
        results['gaps'] = gaps
        yield f"data: {json.dumps({'step': 'gaps', 'status': 'complete', 'data': gaps})}\n\n"
        
        # Step 3: Roadmap  
        yield f"data: {json.dumps({'step': 'roadmap', 'status': 'processing'})}\n\n"
        roadmap = analyze_roadmap(resume_text)
        results['roadmap'] = roadmap
        yield f"data: {json.dumps({'step': 'roadmap', 'status': 'complete', 'data': roadmap})}\n\n"
        
        # Step 4: Keywords
        yield f"data: {json.dumps({'step': 'keywords', 'status': 'processing'})}\n\n"
        keywords = analyze_keywords(resume_text, summary)
        results['keywords'] = keywords
        yield f"data: {json.dumps({'step': 'keywords', 'status': 'complete', 'data': keywords})}\n\n"
        
        # Final complete event with all data
        yield f"data: {json.dumps({'step': 'done', 'status': 'complete', 'data': results})}\n\n"
    
    return StreamingResponse(
        generate_analysis(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/fetch-jobs")
async def get_jobs(keywords: str, location: str = "Türkiye"):
    try:
        # Fetching fewer jobs for speed in demo/dev
        linkedin_jobs = fetch_linkedin_jobs(keywords, location=location, rows=10)
        
        return {
            "linkedin": linkedin_jobs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "AI Job Recommender API is running"}
