from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ..services.ai_service import get_interview_reply, evaluate_interview
from ..db.supabase import save_evaluation_report, get_all_reports, get_report_by_id
from datetime import datetime, timezone
import uuid

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class InterviewRequest(BaseModel):
    messages: List[Message]
    questionIndex: int
    candidateName: str

class EvaluationRequest(BaseModel):
    transcript: List[Dict[str, Any]]
    candidateName: str
    candidateEmail: str
    duration: int

@router.post("/interview")
async def handle_interview(request: InterviewRequest):
    try:
        messages_dict = [{"role": m.role, "content": m.content} for m in request.messages]
        result = await get_interview_reply(messages_dict, request.questionIndex, request.candidateName)
        return result
    except Exception as e:
        print(f"Error in interview endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate")
async def handle_evaluation(request: EvaluationRequest):
    try:
        # Generate evaluation using AI
        evaluation = await evaluate_interview(request.transcript, request.candidateName)
        
        # Build full report
        report_id = f"rpt-{uuid.uuid4().hex[:8]}"
        report = {
            "id": report_id,
            "candidateName": request.candidateName,
            "candidateEmail": request.candidateEmail,
            "interviewDate": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "duration": request.duration,
            "scores": evaluation["scores"],
            "overallScore": sum(evaluation["scores"].values()) / len(evaluation["scores"]),
            "persona": evaluation.get("persona", "Not specified"),
            "recommendation": evaluation["recommendation"],
            "strengths": evaluation.get("strengths", []),
            "concerns": evaluation.get("concerns", []),
            "supportingQuotes": evaluation.get("supportingQuotes", []),
            "interviewerSummary": evaluation.get("interviewerSummary", ""),
            "biasCheck": evaluation.get("biasCheck", ""),
            "transcript": request.transcript
        }
        
        # Save to database
        saved_id = await save_evaluation_report(report)
        
        return {"report": report}
    except Exception as e:
        print(f"Error in evaluation endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports")
async def handle_get_all_reports():
    reports = await get_all_reports()
    return {"reports": reports}

@router.get("/reports/{report_id}")
async def handle_get_report(report_id: str):
    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"report": report}
