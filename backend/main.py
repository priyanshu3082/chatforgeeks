import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from database import seed_sample_data, execute_query, get_schema_info, delete_table
from llm_engine import query_llm
from chart_selector import select_chart
from csv_loader import process_file_upload
from report_generator import generate_pdf_report
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="ChatForGeeks API",
    description="Natural language to SQL BI dashboard backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# In-memory conversation store (keyed by session_id)
conversation_store: dict[str, list[dict]] = {}


# ─────────────────────────────────────────────
# Request / Response models
# ─────────────────────────────────────────────

class QueryRequest(BaseModel):
    prompt: str
    session_id: Optional[str] = "default"
    active_table: Optional[str] = None


class QueryResponse(BaseModel):
    session_id: str
    prompt: str
    sql_query: Optional[str]
    explanation: Optional[str]
    error_message: Optional[str]
    charts: list[dict]
    follow_up_questions: Optional[list[str]] = None
    download_url: Optional[str] = None


class SchemaResponse(BaseModel):
    tables: dict


# ─────────────────────────────────────────────
# Startup
# ─────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    seed_sample_data()


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "ChatForGeeks API"}


@app.get("/schema", response_model=SchemaResponse)
def get_schema():
    """Return the schema of all tables in the database."""
    schema = get_schema_info()
    return {"tables": schema}


class ExecuteRequest(BaseModel):
    sql: str

@app.post("/execute")
def execute_sql(req: ExecuteRequest):
    """
    Run a raw SQL query directly — NO LLM call, no Claude API cost.
    Used by the default dashboard for pre-built fixed queries.
    """
    result = execute_query(req.sql)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return {"columns": result["columns"], "rows": result["rows"], "count": result["count"]}


@app.post("/query", response_model=QueryResponse)
def run_query(req: QueryRequest):
    """
    Accept a natural language prompt, convert to SQL via Claude,
    execute against SQLite, select chart type, return chart data.
    """
    session_id = req.session_id or "default"
    history = conversation_store.setdefault(session_id, [])

    # Call LLM
    llm_result = query_llm(req.prompt, history, req.active_table)

    # Append user turn to history
    history.append({"role": "user", "content": req.prompt})

    error_message = llm_result.get("error_message")
    sql_query = llm_result.get("sql_query")
    explanation = llm_result.get("explanation")
    chart_hint = llm_result.get("chart_recommendation")
    follow_up_questions = llm_result.get("follow_up_questions", [])

    if error_message or not sql_query:
        history.append({"role": "assistant", "content": error_message or "No SQL generated."})
        return QueryResponse(
            session_id=session_id,
            prompt=req.prompt,
            sql_query=None,
            explanation=explanation,
            error_message=error_message or "I cannot answer this question based on available data.",
            charts=[],
            follow_up_questions=follow_up_questions,
            download_url=None,
        )

    # Execute SQL
    db_result = execute_query(sql_query)
    if db_result.get("error"):
        err = db_result["error"]
        history.append({"role": "assistant", "content": f"SQL error: {err}"})
        return QueryResponse(
            session_id=session_id,
            prompt=req.prompt,
            sql_query=sql_query,
            explanation=explanation,
            error_message=f"Query execution failed: {err}",
            charts=[],
            follow_up_questions=follow_up_questions,
            download_url=None,
        )

    columns = db_result["columns"]
    rows = db_result["rows"]

    if not rows:
        history.append({"role": "assistant", "content": "Query returned no data."})
        return QueryResponse(
            session_id=session_id,
            prompt=req.prompt,
            sql_query=sql_query,
            explanation=explanation,
            error_message="No data found for your query.",
            charts=[],
            follow_up_questions=follow_up_questions,
            download_url=None,
        )

    # Select chart
    chart_meta = select_chart(columns, rows, chart_hint)

    chart = {
        "chart_type": chart_meta["chart_type"],
        "x_axis": chart_meta["x_axis"],
        "y_axis": chart_meta["y_axis"],
        "color_key": chart_meta.get("color_key"),
        "title": chart_meta["title"],
        "data": rows,
        "columns": columns,
    }

    history.append({"role": "assistant", "content": explanation or f"Generated {chart_meta['chart_type']} chart."})

    return QueryResponse(
        session_id=session_id,
        prompt=req.prompt,
        sql_query=sql_query,
        explanation=explanation,
        error_message=None,
        charts=[chart],
        follow_up_questions=follow_up_questions,
        download_url=generate_pdf_report(sql_query, explanation, rows),
    )


@app.delete("/session/{session_id}")
def clear_session(session_id: str):
    """Clear conversation history for a session."""
    conversation_store.pop(session_id, None)
    return {"status": "cleared", "session_id": session_id}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file and auto-create a SQLite table."""
    valid_extensions = (".csv", ".json", ".xls", ".xlsx")
    filename_lower = file.filename.lower()
    
    if not any(filename_lower.endswith(ext) for ext in valid_extensions):
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type. Supported types: {', '.join(valid_extensions)}"
        )

    # get extension
    import os
    _, ext = os.path.splitext(filename_lower)

    content = await file.read()
    result = process_file_upload(content, file.filename, ext)

    if result.get("error"):
        import traceback
        raise HTTPException(status_code=422, detail=result["error"])

    return result

@app.delete("/table/{table_name}")
def remove_table(table_name: str):
    """Delete a table from the database."""
    if table_name.lower() == "sales":
        raise HTTPException(status_code=400, detail="Cannot delete the default 'sales' table.")
    
    result = delete_table(table_name)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
