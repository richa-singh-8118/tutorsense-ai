from supabase import create_client, Client
from ..core.config import settings
from typing import List, Dict, Any, Optional
import uuid

# Initialize Supabase client (optional)
supabase: Optional[Client] = None
if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        print(f"[WARNING] Supabase connection failed: {e}. Using in-memory store.")

# ─── In-Memory Fallback Store ───────────────────────────────────────────────
# Used when no Supabase credentials are provided. Data persists for the
# lifetime of the backend process — perfect for demos and local dev.
_in_memory_reports: Dict[str, Dict[str, Any]] = {}

async def save_candidate(name: str, email: str) -> str:
    if not supabase:
        return str(uuid.uuid4())

    data = {
        "name": name,
        "email": email,
        "status": "pending"
    }
    result = supabase.table("candidates").insert(data).execute()
    return result.data[0]["id"]

async def save_evaluation_report(report_data: Dict[str, Any]) -> str:
    # Ensure ID is generated if not present
    if "id" not in report_data:
        report_data["id"] = f"rpt-{uuid.uuid4().hex[:8]}"

    if not supabase:
        # Store in-memory
        _in_memory_reports[report_data["id"]] = report_data
        print(f"[IN-MEMORY] Saved report {report_data['id']} for {report_data.get('candidateName', '?')}")
        return report_data["id"]

    result = supabase.table("reports").insert(report_data).execute()
    return result.data[0]["id"]

async def get_all_reports() -> List[Dict[str, Any]]:
    if not supabase:
        # Return all in-memory reports, sorted newest first
        reports = list(_in_memory_reports.values())
        reports.sort(key=lambda r: r.get("interviewDate", ""), reverse=True)
        return reports

    result = supabase.table("reports").select("*").order("interviewDate", desc=True).execute()
    return result.data

async def get_report_by_id(report_id: str) -> Optional[Dict[str, Any]]:
    if not supabase:
        return _in_memory_reports.get(report_id)

    result = supabase.table("reports").select("*").eq("id", report_id).execute()
    return result.data[0] if result.data else None
