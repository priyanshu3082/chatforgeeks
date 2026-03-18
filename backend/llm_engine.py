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

PRIMARY_MODEL = "claude-sonnet-4-6"
FALLBACK_MODEL = "claude-sonnet-4-20250514"
MAX_RETRIES = 2


def _clean_json(text: str) -> str:
    """Strip markdown code fences and extract JSON."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
    return text.strip()


def build_system_prompt(schema: dict, conversation_history: list[dict]) -> str:
    schema_str = json.dumps(schema, indent=2)
    history_str = ""
    if conversation_history:
        history_str = "\n\nConversation history (for context):\n"
        for turn in conversation_history[-6:]:
            role = "User" if turn["role"] == "user" else "Assistant"
            history_str += f"{role}: {turn['content']}\n"

    return f"""You are an expert data analytics AI assistant that converts natural language business questions into SQL queries. You also provide comprehensive context and follow-up questions.

Database Schema:
{schema_str}

{history_str}

RULES:
1. Generate ONLY valid SQLite SQL queries.
2. Use the exact table and column names from the schema above.
3. Always use aggregation functions (SUM, AVG, COUNT) for numeric insights.
4. If the user asks for trends over time, GROUP BY date/month/year columns.
5. If the user asks for a general "summary" of the dataset, provide a query that selects a broad representative sample (e.g., SELECT * LIMIT 10) OR calculates high-level aggregates across key columns, and use the explanation field to provide a thorough summary of what the data represents.
6. Limit results to 100 rows unless otherwise specified.
7. If you cannot answer with available data, set sql_query to null and explain in error_message.
8. The "explanation" field MUST be a detailed, proper, comprehensive, and helpful response interpreting the data context.
9. At the end of answering, always provide 2 to 3 `follow_up_questions` that are highly relevant to the current question to help the user dive deeper.

RESPONSE FORMAT — always return valid JSON with this exact structure:
{{
  "sql_query": "SELECT ... FROM ... WHERE ... GROUP BY ... ORDER BY ... LIMIT 100",
  "chart_recommendation": {{
    "chart_type": "bar|line|area|pie|scatter",
    "x_axis": "column_name",
    "y_axis": "column_name",
    "color_key": "column_name_or_null"
  }},
  "explanation": "Detailed, thorough explanation of what this query is exploring and the context of the data.",
  "error_message": null,
  "follow_up_questions": ["What is the breakdown by category?", "How has this metric changed over the last 6 months?"]
}}

If the question cannot be answered, return:
{{
  "sql_query": null,
  "chart_recommendation": null,
  "explanation": null,
  "error_message": "I cannot answer this question based on available data. <reason>",
  "follow_up_questions": []
}}
"""


def _call_model(model_name: str, system_prompt: str, user_prompt: str):
    """Call a Claude model with retry on rate-limit errors. Returns (text, exception)."""
    last_exc = None
    for attempt in range(MAX_RETRIES):
        try:
            response = client.messages.create(
                model=model_name,
                max_tokens=1024,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}]
            )
            return response.content[0].text, None
        except Exception as e:
            last_exc = e
            err_str = str(e)
            if "429" in err_str or "rate limits" in err_str.lower() or "quota" in err_str.lower():
                wait = 3  # short wait before retry
                print(f"[LLM] Rate limited on {model_name}. Retry {attempt+1}/{MAX_RETRIES} in {wait}s")
                time.sleep(wait)
            else:
                break  # Non-rate-limit error — don't retry
    return "", last_exc


def query_llm(prompt: str, conversation_history: list[dict], active_table: str = None) -> dict:
    """
    Send a prompt to Claude and return parsed JSON with SQL + chart recommendation.
    Tries PRIMARY_MODEL first, then falls back to FALLBACK_MODEL on persistent rate limit errors.
    """
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
                    "sql_query": None,
                    "chart_recommendation": None,
                    "explanation": None,
                    "error_message": (
                        "The AI service is temporarily rate-limited. "
                        "Please wait 30 seconds and try again."
                    ),
                }
            return {
                "sql_query": None,
                "chart_recommendation": None,
                "explanation": None,
                "error_message": f"AI service error: {err_str[:200]}",
            }

    cleaned = _clean_json(raw_text)
    try:
        result = json.loads(cleaned)
        return result
    except json.JSONDecodeError as e:
        try:
            match = re.search(r'\{.*\}', cleaned, re.DOTALL)
            if match:
                return json.loads(match.group())
        except Exception:
            pass
        return {
            "sql_query": None,
            "chart_recommendation": None,
            "explanation": None,
            "error_message": f"Failed to parse AI response: {str(e)}. Raw: {raw_text[:300]}",
        }
