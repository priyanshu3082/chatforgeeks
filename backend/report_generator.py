import pandas as pd
from fpdf import FPDF
import os
import uuid
from typing import List, Dict, Any

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)

def generate_pdf_report(sql: str, explanation: str, data: List[Dict[str, Any]], title: str = "Analytics Report") -> str:
    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(10)
    
    # Explanation
    pdf.set_font("helvetica", "", 12)
    # Replaces smart quotes or dashes to avoid fpdf encoding errors
    safe_explanation = str(explanation).encode('latin-1', 'replace').decode('latin-1')
    pdf.multi_cell(0, 8, safe_explanation, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)
    
    # Build dataframe for summary
    if data:
        df = pd.DataFrame(data)
        pdf.set_font("helvetica", "B", 12)
        pdf.cell(0, 10, "Data Sample (Top 10 Rows)", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("helvetica", "", 9)
        
        # Simple table snapshot - up to 5 cols to fit page width
        display_cols = df.columns[:5]
        col_width = 38
        
        # Headers
        for col in display_cols:
            pdf.cell(col_width, 8, str(col)[:15], border=1)
        pdf.ln(8)
        
        # Rows
        for index, row in df.head(10).iterrows():
            for col in display_cols:
                val = str(row[col])[:20].encode('latin-1', 'replace').decode('latin-1')
                pdf.cell(col_width, 6, val, border=1)
            pdf.ln(6)
    
    # Output path
    filename = f"report_{uuid.uuid4().hex[:8]}.pdf"
    path = os.path.join(STATIC_DIR, filename)
    pdf.output(path)
    
    return f"/static/{filename}"
