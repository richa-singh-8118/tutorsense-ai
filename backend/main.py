"""
TutorSense AI Backend - Entry Point
This file is a legacy entry. Use `python run.py` or `uvicorn app.main:app` from the backend/ directory.
"""
import uvicorn
import os
import sys

# Add current directory to path so 'app' can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
