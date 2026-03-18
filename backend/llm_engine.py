import os
import json
import re
import time
import anthropic
from dotenv import load_dotenv
from database import get_schema_info

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# Cheapest models available on this API key
PRIMARY_MODEL  = "claude-haiku-4-5-20251001"   # Cheapest available — very fast & low cost
FALLBACK_MODEL = "claude-sonnet-4-20250514"     # Fallback if haiku rate-limited
MAX_RETRIES = 2


def _clean_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
    return text.strip()


def build_system_prompt(schema: dict, conversation_history: list) -> str:
    # Compact schema — only table/column names + types, no indentation
    schema_lines = []
    for tbl, cols in schema.items():
        col_str = ", ".join(f"{c['name']}({c['type']})" for c in cols)
        schema_lines.append(f"Table {tbl}: {col_str}")
    schema_str = "\n".join(schema_lines)

    # Keep only the last 2 turns (1 exchange) to save tokens
    history_str = ""
    if conversation_history:
        recent = conversation_history[-2:]
        history_str = "Recent:\n" + "\n".join(
            f"{'U' if t['role'] == 'user' else 'A'}: {str(t['content'])[:120]}"
            for t in recent
        )

    return f"""You are a BI SQL assistant. Convert questions to SQLite SQL.

Schema:
{schema_str}
{history_str}

Rules:
1. Return ONLY valid SQLite SQL.
2. Use exact table/column names from schema.
3. Use SUM/AVG/COUNT for numeric insights.
4. GROUP BY date columns for trends.
5. For "summary" requests: aggregate key columns, give a thorough explanation.
6. LIMIT 50 rows max.
7. If unanswerable, set sql_query null and explain in error_message.
8. explanation: clear, concise, 2-3 sentences max.
9. Always give 2 follow_up_questions.

Return ONLY this JSON:
{{"sql_query":"...","chart_recommendation":{{"chart_type":"bar|line|area|pie|scatter","x_axis":"col","y_axis":"col","color_key":null}},"explanation":"...","error_message":null,"follow_up_questions":["...","..."]}}"""


def _call_model(model_name: str, system_prompt: str, user_prompt: str):
    last_exc = None
    for attempt in range(MAX_RETRIES):
        try:
            response = client.messages.create(
                model=model_name,
                max_tokens=600,          # Was 2048 — saves ~70% output cost
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}]
            )
            return response.content[0].text, None
        except Exception as e:
            last_exc = e
            err_str = str(e)
            if "429" in err_str or "rate limits" in err_str.lower() or "quota" in err_str.lower():
                wait = 3
                print(f"[LLM] Rate limited on {model_name}. Retry {attempt+1}/{MAX_RETRIES} in {wait}s")
                time.sleep(wait)
            else:
                break
    return "", last_exc


def query_llm(prompt: str, conversation_history: list, active_table: str = None) -> dict:
    schema = get_schema_info(active_table)
    system_prompt = build_system_prompt(schema, conversation_history)

    raw_text = ""
    for model_name in [PRIMARY_MODEL, FALLBACK_MODEL]:
        raw_text, exc = _call_model(model_name, system_prompt, prompt)
        if not exc:
            break
        print(f"[LLM] Model {model_name} failed: {exc}")
        if model_name == FALLBACK_MODEL:
            err_str = str(exc)
            if "429" in err_str:
                return {
                    "sql_query": None, "chart_recommendation": None, "explanation": None,
                    "error_message": "AI rate-limited. Please wait 30s and try again.",
                }
            return {
                "sql_query": None, "chart_recommendation": None, "explanation": None,
                "error_message": f"AI error: {err_str[:150]}",
            }

    cleaned = _clean_json(raw_text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        try:
            match = re.search(r'\{.*\}', cleaned, re.DOTALL)
            if match:
                return json.loads(match.group())
        except Exception:
            pass
        return {
            "sql_query": None, "chart_recommendation": None, "explanation": None,
            "error_message": f"Could not parse AI response. Try rephrasing your question.",
        }
