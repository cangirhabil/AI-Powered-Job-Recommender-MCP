import fitz  # PyMuPDF
import os
from dotenv import load_dotenv
from openai import OpenAI
from apify_client import ApifyClient

load_dotenv()

# Initialize OpenAI Client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Initialize Apify Client
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")
apify_client = ApifyClient(APIFY_API_TOKEN) if APIFY_API_TOKEN else None

def extract_text_from_pdf(pdf_content):
    """Extracts text from PDF bytes."""
    doc = fitz.open(stream=pdf_content, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def ask_openai(prompt, max_tokens=500):
    """Sends a prompt to OpenAI and returns the response."""
    if not openai_client:
        return "OpenAI API Key is missing."
    
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=max_tokens
    )
    return response.choices[0].message.content

def fetch_linkedin_jobs(search_query, location="india", rows=10):
    """Fetches jobs from LinkedIn via Apify."""
    if not apify_client:
        return []
    
    run_input = {
        "title": search_query,
        "location": location,
        "rows": rows,
        "proxy": {
            "useApifyProxy": True,
            "apifyProxyGroups": ["RESIDENTIAL"],
        }
    }
    run = apify_client.actor("BHzefUZlZRKWxkTck").call(run_input=run_input)
    jobs = list(apify_client.dataset(run["defaultDatasetId"]).iterate_items())
    return jobs

def fetch_naukri_jobs(search_query, location="india", rows=10):
    """Fetches jobs from Naukri via Apify."""
    if not apify_client:
        return []

    run_input = {
        "keyword": search_query,
        "maxJobs": rows,
        "freshness": "all",
        "sortBy": "relevance",
        "experience": "all",
    }
    run = apify_client.actor("alpcnRV9YI9lYVPWk").call(run_input=run_input)
    jobs = list(apify_client.dataset(run["defaultDatasetId"]).iterate_items())
    return jobs
