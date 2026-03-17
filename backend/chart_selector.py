from typing import Optional
import re


TIME_KEYWORDS = {"date", "month", "year", "week", "quarter", "day", "time", "period"}
CATEGORY_KEYWORDS = {"region", "category", "product", "type", "group", "department", "status", "name", "segment"}
NUMERIC_KEYWORDS = {"revenue", "profit", "sales", "count", "amount", "total", "sum", "avg", "average", "price", "cost"}


def infer_column_role(col_name: str) -> str:
    """Infer the semantic role of a column from its name."""
    col_lower = col_name.lower()
    if any(k in col_lower for k in TIME_KEYWORDS):
        return "time"
    if any(k in col_lower for k in CATEGORY_KEYWORDS):
        return "category"
    if any(k in col_lower for k in NUMERIC_KEYWORDS):
        return "numeric"
    return "unknown"


def select_chart(columns: list[str], rows: list[dict], hint: Optional[dict] = None) -> dict:
    """
    Automatically choose the best chart type based on data shape and column semantics.

    Returns:
        {
            "chart_type": str,  # "bar" | "line" | "pie" | "scatter" | "area"
            "x_axis": str,
            "y_axis": str,
            "color_key": str | None,
            "title": str,
        }
    """
    if hint and hint.get("chart_type"):
        # LLM already suggested a chart type; use it but still figure out axes
        chart_type = hint.get("chart_type", "bar")
        x = hint.get("x_axis", columns[0] if columns else "x")
        y = hint.get("y_axis", columns[1] if len(columns) > 1 else "y")
        color_key = hint.get("color_key")
        return {
            "chart_type": chart_type,
            "x_axis": x,
            "y_axis": y,
            "color_key": color_key,
            "title": _build_title(chart_type, x, y),
        }

    if not columns or not rows:
        return {"chart_type": "bar", "x_axis": "x", "y_axis": "y", "color_key": None, "title": "Chart"}

    roles = {col: infer_column_role(col) for col in columns}
    time_cols = [c for c, r in roles.items() if r == "time"]
    cat_cols = [c for c, r in roles.items() if r == "category"]
    num_cols = [c for c, r in roles.items() if r == "numeric"]

    # Fallback: guess from data types in first row
    if not num_cols:
        for col in columns:
            val = rows[0].get(col)
            if isinstance(val, (int, float)):
                num_cols.append(col)
        num_cols = [c for c in num_cols if c not in time_cols and c not in cat_cols]

    if not num_cols:
        num_cols = [columns[-1]] if columns else ["value"]

    x_col = time_cols[0] if time_cols else (cat_cols[0] if cat_cols else columns[0])
    y_col = num_cols[0] if num_cols else (columns[1] if len(columns) > 1 else columns[0])
    color_key = cat_cols[1] if len(cat_cols) > 1 else (cat_cols[0] if cat_cols and x_col not in cat_cols else None)

    n_rows = len(rows)
    n_unique_x = len(set(str(r.get(x_col, "")) for r in rows))

    # Selection rules
    if time_cols:
        chart_type = "line" if n_rows > 12 else "area"
    elif cat_cols and n_unique_x <= 6 and len(num_cols) == 1:
        chart_type = "pie"
    elif len(num_cols) >= 2 and not time_cols and not cat_cols:
        chart_type = "scatter"
    elif cat_cols:
        chart_type = "bar"
    else:
        chart_type = "bar"

    return {
        "chart_type": chart_type,
        "x_axis": x_col,
        "y_axis": y_col,
        "color_key": color_key,
        "title": _build_title(chart_type, x_col, y_col),
    }


def _build_title(chart_type: str, x: str, y: str) -> str:
    labels = {
        "bar": f"{y.replace('_', ' ').title()} by {x.replace('_', ' ').title()}",
        "line": f"{y.replace('_', ' ').title()} Over {x.replace('_', ' ').title()}",
        "area": f"{y.replace('_', ' ').title()} Trend",
        "pie": f"Distribution of {y.replace('_', ' ').title()} by {x.replace('_', ' ').title()}",
        "scatter": f"{x.replace('_', ' ').title()} vs {y.replace('_', ' ').title()}",
    }
    return labels.get(chart_type, "Chart")
