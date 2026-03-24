#!/usr/bin/env python3
"""
Start script for CuraCore Backend
"""
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    # Print configuration
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    print("🤖 Starting CuraCore Backend")
    print("=" * 40)
    print(f"AI Service Mode: LLM - GEMINI 2.5 FLASH")
    print(f"Server: http://{host}:{port}")
    print(f"API Docs: http://{host}:{port}/docs")
    print("=" * 40)
    
    # Start server
    uvicorn.run(
        "main:app", 
        host=host, 
        port=port, 
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()