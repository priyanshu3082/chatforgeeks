import pandas as pd
from fpdf import FPDF
import os
import uuid
from typing import List, Dict, Any

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)

def generate_pdf_report(sql: str, explanation: str, data: List[Dict[str, Any]], charts: List[Dict[str, Any]] = None, title: str = "Analytics Report") -> str:
    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(10)
    
    # Explanation
    pdf.set_font("helvetica", "", 12)
    safe_explanation = str(explanation).encode('latin-1', 'replace').decode('latin-1')
    pdf.multi_cell(0, 8, safe_explanation, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)
    
    # Render and embed Charts
    saved_images = []
    if charts:
        for i, chart in enumerate(charts):
            c_type = chart.get("chart_type")
            x_col = chart.get("x_axis")
            y_col = chart.get("y_axis")
            c_title = chart.get("title", f"Chart {i+1}")
            c_data = chart.get("data", [])
            
            if not c_data or c_type not in ["bar", "line", "area", "scatter", "pie", "heatmap"]:
                continue
                
            df_c = pd.DataFrame(c_data)
            if df_c.empty or x_col not in df_c.columns or y_col not in df_c.columns:
                continue

            fig, ax = plt.subplots(figsize=(7, 4))
            
            try:
                x_vals = df_c[x_col].astype(str)
                # Convert Y to numeric, replacing bad values with 0
                y_vals = pd.to_numeric(df_c[y_col], errors='coerce').fillna(0)
                
                if c_type == "bar":
                    ax.bar(x_vals, y_vals, color="#2bc574")
                elif c_type == "line":
                    ax.plot(x_vals, y_vals, marker='o', color="#7c3aed")
                elif c_type == "area":
                    ax.fill_between(x_vals, y_vals, color="#d97706", alpha=0.4)
                    ax.plot(x_vals, y_vals, color="#d97706")
                elif c_type == "pie":
                    # For pie, we need numeric values
                    # if sum is 0 it will fail, add a fallback check
                    if y_vals.sum() > 0:
                        ax.pie(y_vals, labels=x_vals, autopct='%1.1f%%')
                    else:
                        ax.text(0.5, 0.5, "No numeric data for pie chart", ha='center', va='center')
                elif c_type == "scatter":
                    # Attempt to plot scatter with numeric X if possible, else categorical
                    ax.scatter(df_c[x_col], y_vals, color="#0d9488")
                elif c_type == "heatmap":
                    # Proxy heat-map via horizontal bar
                    ax.barh(x_vals, y_vals, color="#db2777")
                    
                ax.set_title(c_title)
                if c_type != "pie":
                    ax.set_xlabel(str(x_col).replace("_", " ").title())
                    ax.set_ylabel(str(y_col).replace("_", " ").title())
                    plt.setp(ax.get_xticklabels(), rotation=45, ha="right")
                    
                plt.tight_layout()
                img_filename = f"chart_{uuid.uuid4().hex[:8]}.png"
                img_path = os.path.join(STATIC_DIR, img_filename)
                fig.savefig(img_path)
                plt.close(fig)
                saved_images.append(img_path)
                
                pdf.add_page()
                # Center the image roughly
                pdf.image(img_path, x=15, w=180)
            except Exception as e:
                print(f"Failed to render chart {c_title}: {e}")
                plt.close(fig)
    
    # Build dataframe for summary table
    if data:
        df = pd.DataFrame(data)
        pdf.add_page()
        pdf.set_font("helvetica", "B", 12)
        pdf.cell(0, 10, "Data Sample (Top 10 Rows)", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("helvetica", "", 9)
        
        display_cols = df.columns[:5]
        col_width = 38
        
        for col in display_cols:
            pdf.cell(col_width, 8, str(col)[:15], border=1)
        pdf.ln(8)
        
        for index, row in df.head(10).iterrows():
            for col in display_cols:
                val = str(row[col])[:20].encode('latin-1', 'replace').decode('latin-1')
                pdf.cell(col_width, 6, val, border=1)
            pdf.ln(6)
    
    # Output path
    filename = f"report_{uuid.uuid4().hex[:8]}.pdf"
    path = os.path.join(STATIC_DIR, filename)
    pdf.output(path)
    
    # Cleanup temp chart images automatically
    for img_path in saved_images:
        try:
            os.remove(img_path)
        except:
            pass
            
    return f"/static/{filename}"
